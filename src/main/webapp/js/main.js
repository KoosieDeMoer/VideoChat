/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';


var baseTarget = "/WebRTC/";

var mode;
var CALL_MODE = 'call';
var ANSWER_MODE = 'answer';

var callType = null;

var conversationType = null;
var queue = null;

var callerTxCandidatesDone;
var answererRxCandidatesDone;

var pcForLastReceivedIceCandidate;

var listeningForAnswererInterval = 2000;
var myPartyName;
var otherPartyName;

var streamUp = false;

var onCall = false;

var input1Input;
try {
	input1Input = document.querySelector('input#input1');
	input1Input.onkeyup = updateMyName;

} catch(e){};

var input2Input;
try {
	input2Input = document.querySelector('input#input2');
} catch(e){};


var authenticateButton;
try {
	authenticateButton = document.querySelector('button#authenticateButton');
} catch(e){};


var callButtons;
try {
	callButtons = document.querySelector('#callButtons');
} catch(e){};


var infoVideoButton;
try {
	infoVideoButton = document.querySelector('button#infoVideoButton');
	infoVideoButton.disabled = true;
	infoVideoButton.onclick = infoVideoCall;
	
} catch(e){};

var infoAudioButton;
try {
	infoAudioButton = document.querySelector('button#infoAudioButton');
	infoAudioButton.disabled = true;
	infoAudioButton.onclick = infoAudioCall;
} catch(e){};

var infoImButton;
try {
	infoImButton = document.querySelector('button#infoImButton');
	infoImButton.disabled = true;
	infoImButton.onclick = infoImCall;
} catch(e){};

var privateBankingVideoButton;
try {
	privateBankingVideoButton = document.querySelector('button#privateBankingVideoButton');
	var pinSubmitButton = document.querySelector('button#pinSubmitVideoButton');
	privateBankingVideoButton.setAttribute('data-toggle', 'modal');
	privateBankingVideoButton.setAttribute('data-target', '#myVideoModal');
	privateBankingVideoButton.disabled = true;
	pinSubmitButton.onclick = privateBankingVideoCall;
	
} catch(e){};

var privateBankingAudioButton;
try {
	privateBankingAudioButton = document.querySelector('button#privateBankingAudioButton');
	var pinSubmitButton = document.querySelector('button#pinSubmitAudioButton');
	privateBankingAudioButton.setAttribute('data-toggle', 'modal');
	privateBankingAudioButton.setAttribute('data-target', '#myAudioModal');
	privateBankingAudioButton.disabled = true;
	pinSubmitButton.onclick = privateBankingAudioCall;
} catch(e){};

var privateBankingImButton;
try {
	privateBankingImButton = document.querySelector('button#privateBankingImButton');
	var pinSubmitButton = document.querySelector('button#pinSubmitImButton');
	privateBankingImButton.setAttribute('data-toggle', 'modal');
	privateBankingImButton.setAttribute('data-target', '#myImModal');
	privateBankingImButton.disabled = true;
	pinSubmitButton.onclick = privateBankingImCall;
} catch(e){};

var techSupportVideoButton;
try {
	techSupportVideoButton = document.querySelector('button#techSupportVideoButton');
	techSupportVideoButton.disabled = true;
	techSupportVideoButton.onclick = techSupportVideoCall;
	
} catch(e){};

var techSupportAudioButton;
try {
	techSupportAudioButton = document.querySelector('button#techSupportAudioButton');
	techSupportAudioButton.disabled = true;
	techSupportAudioButton.onclick = techSupportAudioCall;
} catch(e){};

var techSupportImButton;
try {
	techSupportImButton = document.querySelector('button#techSupportImButton');
	techSupportImButton.disabled = true;
	techSupportImButton.onclick = techSupportImCall;
} catch(e){};


var answerButton;
try {
	answerButton = document.querySelector('button#answerButton');
} catch(e){};

var hangupButton;
try {
	hangupButton = document.querySelector('button#hangupButton');
} catch(e){};

var callCentreSelect;
try {
	callCentreSelect = document.querySelector('select#callCentre');
} catch(e){};




if(authenticateButton != null) 
	authenticateButton.onclick = authenticate;


if(answerButton != null) 
	answerButton.onclick = answer;

if(hangupButton != null) 
	hangupButton.onclick = hangup;

if(callCentreSelect != null) 
	callCentreSelect.onchange = selectCallCentre;


var txStateDiv = document.querySelector('div#txState');
var txIceStateDiv = document.querySelector('div#txIceState');
var rxStateDiv = document.querySelector('div#rxState');
var rxIceStateDiv = document.querySelector('div#rxIceState');

var localstream;
var tx;
var rx;

function updateMyName(event) {
	var buttonsDisabled = input1Input.value === ''
	infoVideoButton.disabled = buttonsDisabled;
	infoAudioButton.disabled = buttonsDisabled;
	infoImButton.disabled = buttonsDisabled;
	privateBankingVideoButton.disabled = buttonsDisabled;
	privateBankingAudioButton.disabled = buttonsDisabled;
	privateBankingImButton.disabled = buttonsDisabled;
	techSupportVideoButton.disabled = buttonsDisabled;
	techSupportAudioButton.disabled = buttonsDisabled;
	techSupportImButton.disabled = buttonsDisabled;
}


function infoVideoCall() {
	call('video', 'info');
  
}

function infoAudioCall() {
	call('audio', 'info');
  
}

function infoImCall() {
	call('im', 'info');
}

function privateBankingVideoCall() {
	call('video', 'privateBanking');
}

function privateBankingAudioCall() {
	call('audio', 'privateBanking');
}

function privateBankingImCall() {
	call('im', 'privateBanking');
}

function techSupportVideoCall() {
	call('video', 'techSupport');
}

function techSupportAudioCall() {
	call('audio', 'techSupport');
}

function techSupportImCall() {
	call('im', 'techSupport');
}


function call(type, callCentre) {
	callType = type;
	  trace('Starting calling');
	  if((type === 'video') || (type === 'audio')) { 
		  createConversation(type);
	  } else { // 'im'
		  connect_im(input1Input.value);
	  }
	  registerCall(callCentre, input1Input.value, type);
	  callButtons.style.cssText = 'display: none;';
	  hangupButtons.style.cssText = 'display: block; min-width: 878px; text-align: right; background-color: #ffffff; border: none;';
  
	}



function registerCall(callCentre, callerName, type) {
    fetch( baseTarget + 'call/' + callCentre + '/' + callerName,  {
        method: "PUT",
        body: type
        
    } )
    .then(function() {startListeningForAnswerer(); })
    .catch( function(error) {console.log(error);});
	
}

function startListeningForAnswerer() {
	// TODO make some ringing sounds
}




function answer(caller, type) {
	  onCall = true;
	  otherPartyName = caller;
	  callType = type;
	  answererRxCandidatesDone = false;
	  registerAnswer(queue, otherPartyName);

	  if((callType === 'video') || (callType === 'audio')) { 
		  joinConversation(callType);
	  } else { // 'im'
		  answer_im(otherPartyName, 'Sam');
	  }

	  
	  input2Input.value = otherPartyName;
	  document.querySelector('div#waitingDiv').style.cssText = 'display: none';
	  document.querySelector('div#hangupButtons').style.cssText = 'display: block';
	  document.querySelector('div#otherPartyDiv').style.cssText = 'display: block';
	  
	
}

function registerAnswer(queue, callerName) {
	console.log('answering: ' + queue + '/' + callerName);
    fetch( baseTarget + 'call/' + queue + '/' + callerName,  {
        method: "DELETE"
    } )
    .then(function() {console.log('deleted: ' + queue + '/' + callerName);})
    .catch( function(error) {console.log(error);});
	
}


function hangup() {
  trace('Ending call');
  
  if((callType === 'video') || (callType === 'audio')) { 
	  leaveConversation();
  } else { // 'im'
	  leave_im();
  }
 
  onCall = false;
  
  hangupButtons.style.cssText = 'display: none';
  document.querySelector('div#container').style.cssText = "display: none";
  
  console.log(mode + ' ' + ANSWER_MODE);
   if(mode == ANSWER_MODE) {
	  window.close();
	  // did not open with script
	  window.location.reload();
  } else {
	  callButtons.style.cssText = 'display: block; min-width: 820px; max-width: 920px; background-color: #ffffff; border: none;';

  }

}


function trace(arg) {
	  var now = (window.performance.now() / 1000).toFixed(3);
	  console.log(now + ': ', arg);
}

function sleep(ms) {
  var e = new Date().getTime() + (ms);
  while (new Date().getTime() <= e) {}
}
