var videoConfig = {
	video : true,
	audio : true
}

var audioConfig = {
	audio : true
}

var callTypes = {
	"video" : videoConfig,
	"audio" : audioConfig
};

var mediaConfig = {
	video : true,
	audio : true
};

var createConversation = function(type) {
	var convId = $('#input1').val();
	mediaConfig = callTypes[type];
	nextRTC.create(convId);
};
var createBroadcastConversation = function() {
	var convId = $('#input1').val();
	nextRTC.create(convId, {
		type : 'BROADCAST'
	});
};

var joinConversation = function(type) {
	var convId = otherPartyName;
	console.log('joinConversation(): ' + convId + ', type: ' + type);
	mediaConfig = callTypes[type];
	console.log('about to nextRTC.join(): ' + convId + ', mediaConfig: ' + mediaConfig);
	nextRTC.join(convId);
};

var leaveConversation = function() {
	$('#container').empty();
	nextRTC.leave();
};

var nextRTC = new NextRTC({
	wsURL : 'wss://' + location.hostname
			+ (location.port ? ':' + location.port : '') + '/signaling',
	peerConfig : {
		iceServers : [ {
			urls : "stun:23.21.150.121"
		}, {
			urls : "stun:stun.l.google.com:19302"
		}, {
			urls : "turn:34.218.93.72",
			credential : "ring",
			username : "bell"
		} ],
		iceTransportPolicy : 'all'
	}
});

nextRTC.on('created', function(nextRTC, event) {
	console.log('created: ' + JSON.stringify(event));
});

nextRTC.on('joined', function(nextRTC, event) {
	console.log('joined: ' + JSON.stringify(event));
});

nextRTC.on('newJoined', function(nextRTC, event) {
	console.log('newJoined: ' + JSON.stringify(event));
});

nextRTC.on('localStream', function(member, stream) {
	console.log('assigning local stream: ' + member + ', stream: ' + stream);
	var dest = $("#templateOutgoing").clone().prop({
		id : 'local'
	});
	$("#container").append(dest);
	document.querySelector('div#container').style = "display: block";
	dest[0].srcObject = stream.stream;
	dest[0].muted = true;
});

nextRTC.on('remoteStream', function(member, stream) {
	var dest = $("#templateIncoming").clone().prop({
		id : stream.member
	});
	$("#container").append(dest);
	dest[0].srcObject = stream.stream;
});

nextRTC.on('left', function(nextRTC, event) {
	nextRTC.release(event.from);
	console.log(JSON.stringify(event));
	$('#' + event.from).remove();
});

nextRTC.on('error', function(nextRTC, event) {
	console.log(JSON.stringify(event));
});


