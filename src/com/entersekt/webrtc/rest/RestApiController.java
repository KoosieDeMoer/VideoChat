package com.entersekt.webrtc.rest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/WebRTC")
public class RestApiController {

	public static final Logger log = LoggerFactory.getLogger(RestApiController.class);

	@Autowired
	ApplicationContext applicationContext;

	@RequestMapping(value = "call/{queue}/{id}", method = RequestMethod.PUT, consumes = { MediaType.TEXT_PLAIN_VALUE }, produces = { MediaType.TEXT_PLAIN_VALUE })
	public ResponseEntity<String> putCall(@PathVariable("queue") String queue, @PathVariable("id") String id,
			@RequestBody(required = false) String type) throws Exception {
		log.info("Adding call (" + queue + ") from: " + id + " to: " + type);
		App.calls.get(queue).put(id, type);
		return new ResponseEntity<String>("Ok", HttpStatus.OK);
	}

	@RequestMapping(value = "calls", method = RequestMethod.GET, produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<Map<String, Map<String, String>>> listCalls() throws Exception {
		log.info("Listing all calls");
		Map<String, Map<String, String>> retVal = new HashMap<>();
		for (Entry<String, Map<String, String>> callCentreEntry : App.calls.entrySet()) {
			// storing the count as a String (rather than Integer) because saves Jackson serialisation pain
			Map<String, String> countPerCallType = new HashMap<>();
			countPerCallType.put("video", "0");
			countPerCallType.put("audio", "0");
			countPerCallType.put("im", "0");
			for (Entry<String, String> callEntry : callCentreEntry.getValue().entrySet()) {
				final String callType = callEntry.getValue();
				int callCountPerType = Integer.parseInt(countPerCallType.get(callType));
				countPerCallType.put(callType, Integer.toString(++callCountPerType));
			}
			retVal.put(callCentreEntry.getKey(), countPerCallType);
		}

		return new ResponseEntity<Map<String, Map<String, String>>>(retVal, HttpStatus.OK);
	}

	@RequestMapping(value = "calls/{queue}", method = RequestMethod.GET, produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<Pair[]> listCalls(@PathVariable("queue") String queue) throws Exception {
		log.info("Listing all calls for: " + queue);
		List<Pair> retVal = new ArrayList<>();
		final Map<String, String> calls = App.calls.get(queue);
		for (Entry<String, String> entry : calls.entrySet()) {
			retVal.add(new Pair(entry.getKey(), entry.getValue()));
		}
		return new ResponseEntity<Pair[]>(retVal.toArray(new Pair[0]), HttpStatus.OK);
	}

	@RequestMapping(value = "calls/{queue}/{type}", method = RequestMethod.GET, produces = { MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<String[]> listCalls(@PathVariable("queue") String queue, @PathVariable("type") String type)
			throws Exception {
		log.info("Listing calls for: " + queue + ", " + type);

		List<String> retVal = new ArrayList<>();
		Map<String, String> callCentreEntry = App.calls.get(queue);
		// storing the count as a String (rather than Integer) because saves Jackson serialisation pain
		for (Entry<String, String> callEntry : callCentreEntry.entrySet()) {
			final String callType = callEntry.getValue();
			if (callType.equals(type)) {
				retVal.add(callEntry.getKey());
			}
		}

		return new ResponseEntity<String[]>(retVal.toArray(new String[0]), HttpStatus.OK);
	}

	@RequestMapping(value = "call/{queue}/{id}", method = RequestMethod.DELETE, produces = { MediaType.TEXT_PLAIN_VALUE })
	public ResponseEntity<String> deleteCall(@PathVariable("queue") String queue, @PathVariable("id") String id)
			throws Exception {
		if (App.calls.get(queue).containsKey(id)) {
			log.info("Deleting (" + queue + ") call: " + id);
			App.calls.get(queue).remove(id);
		}
		return new ResponseEntity<String>("Ok", HttpStatus.OK);
	}

}