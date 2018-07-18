package com.entersekt.webrtc.rest;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import springfox.documentation.swagger2.annotations.EnableSwagger2;

import com.entersekt.webrtc.security.SpringSecurityConfig;
import com.entersekt.webrtc.signalling.EndpointConfig;
import com.entersekt.webrtc.signalling.SomeClass;
import com.example.websocketdemo.config.WebSocketConfig;
import com.example.websocketdemo.controller.ChatController;

@Configuration
@EnableAutoConfiguration
@Import(EndpointConfig.class)
// /swagger-ui.html#
@EnableSwagger2
@ComponentScan(basePackageClasses = { RestApiController.class, WebSocketConfig.class, ChatController.class,
		SpringSecurityConfig.class })
public class App {

	public static Map<String, Map<String, String>> calls = new HashMap<>();

	static {
		calls.put("info", new HashMap<String, String>());
		calls.put("privateBanking", new HashMap<String, String>());
		calls.put("techSupport", new HashMap<String, String>());
	}

	static SomeClass someClass = new SomeClass();

	public static void main(String[] args) throws Exception {
		SpringApplication.run(App.class, args);
	}
}
