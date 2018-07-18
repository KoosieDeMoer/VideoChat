'use strict';

var chatPage = document.querySelector('#chat-page');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var subscription = null;
var username = null;
var agentName = null;
var topic = null;

var colors = [ '#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107',
		'#ff85af', '#FF9800', '#39bbb0' ];

function connect_im(callerName) {
	username = callerName;
	topic = username;

	var socket = new SockJS('/ws');
	stompClient = Stomp.over(socket);

	stompClient.connect({}, onConnected_im, onError);

}

function answer_im(callerName, agentNameArg) {
	username = callerName;
	agentName = agentNameArg;
	topic = username;

	var socket = new SockJS('/ws');
	stompClient = Stomp.over(socket);
	stompClient.connect({}, onAnswered_im, onError);

}

function onConnected_im() {
	// Subscribe to the Public Topic
	subscription = stompClient.subscribe('/topic/' + topic, onMessageReceived);

	// Tell your username to the server
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({
		sender : username,
		type : 'JOIN'
	}))

	connectingElement.classList.add('hidden');
	chatPage.style = "display: block; height: 2200px; background-color: #ffffff; border: none;";
}

function onAnswered_im() {
	// Subscribe to the Public Topic
	subscription = stompClient.subscribe('/topic/' + topic, onMessageReceived);
	username = agentName;
	// Tell your username to the server
	stompClient.send("/app/chat.addUser", {}, JSON.stringify({
		sender : username,
		type : 'JOIN'
	}))

	document.querySelector('div#waitingDiv').style = 'display: none';
	document.querySelector('div#hangupButtons').style = 'display: block';
	document.querySelector('div#otherPartyDiv').style = 'display: block';

	sendMessageInner("Hi " + topic + ", I'm " + agentName
			+ ".How can I assist you today? ");

	connectingElement.classList.add('hidden');
	chatPage.style = "display: block";

}

function leave_im() {
	chatPage.style = "display: none";
	subscription.unsubscribe();
	messageArea.innerHTML = '';
	connectingElement.classList.remove('hidden');

}

function onError(error) {
	connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
	connectingElement.style.color = 'red';
}

function sendMessage(event) {
	sendMessageInner(messageInput.value.trim());

	event.preventDefault();
}

function sendMessageInner(messageContent) {

	if (messageContent && stompClient) {
		var chatMessage = {
			sender : username,
			content : messageContent,
			type : 'CHAT'
		};

		stompClient.send('/app/chat.sendMessage/' + topic, {}, JSON
				.stringify(chatMessage));
		console.log('sent:' + chatMessage + ' to: ' + topic);
		messageInput.value = '';
	}

}

function onMessageReceived(payload) {
	var message = JSON.parse(payload.body);
	console.log(message);

	var messageElement = document.createElement('li');

	if (message.type === 'JOIN') {
		messageElement.classList.add('event-message');
		message.content = message.sender + ' joined!';
	} else if (message.type === 'LEAVE') {
		messageElement.classList.add('event-message');
		message.content = message.sender + ' left!';
	} else {
		messageElement.classList.add('chat-message');

		var avatarElement = document.createElement('i');
		var avatarText = document.createTextNode(message.sender[0]);
		avatarElement.appendChild(avatarText);
		avatarElement.style['background-color'] = getAvatarColor(message.sender);

		messageElement.appendChild(avatarElement);

		var usernameElement = document.createElement('span');
		var usernameText = document.createTextNode(message.sender);
		usernameElement.appendChild(usernameText);
		messageElement.appendChild(usernameElement);
	}

	var textElement = document.createElement('p');
	var messageText = document.createTextNode(message.content);
	textElement.appendChild(messageText);

	messageElement.appendChild(textElement);

	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender) {
	var hash = 0;
	for (var i = 0; i < messageSender.length; i++) {
		hash = 31 * hash + messageSender.charCodeAt(i);
	}

	var index = Math.abs(hash % colors.length);
	return colors[index];
}

messageForm.addEventListener('submit', sendMessage, true)
