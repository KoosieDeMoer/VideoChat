'use strict';
var module = angular.module("MainModule", []);

module
		.controller(
				"MainController",
				function($scope, $http, $window) {

					var LISTENER_INTERVAL = 500; // ms

					$scope.model = {
							waitingCallsQueue : {}
,
							docUrl : ""
					};

					$scope.signButtonDisabled = false;

					$scope.waitForCalls = function() {
						setTimeout(function () {
						    fetch( baseTarget + 'calls')
						    .then(function(response){ return response.json();})
						    .then(function(data){
						    		$scope.model.waitingCallsQueue = data;
						    		$scope.$apply(); // why this now
						    		$scope.waitForCalls();
				 		    	})
						    .catch( function(error){
						    	console.log(error);
						    	waitForCalls();
						    });
						    

						}, LISTENER_INTERVAL);
				}

					$scope.popAnswerWindow = function(queue, type) {
		    			$window.open('/answer?queue=' + queue + '&type=' + type, '_blank', 'left=500,top=10,height=550,width=800,scrollbars=yes,status=yes');					    			
				}

					$scope.answerFirstCall = function() {
						queue = (new window.URL(location.href)).searchParams
						.get('queue');
						var type = (new window.URL(location.href)).searchParams
						.get('type');

						setTimeout(function () {
						    fetch( baseTarget + 'calls/' + queue + '/' + type)
						    .then(function(response) { return response.json();})
						    .then(function(data) {
						    		if(data.length > 0) {
						    			console.log('Answering: ' + data[0] + ', ' + type);
						    			answer(data[0], type);
						    		} else {
						    			document.querySelector('div#waitingDiv').style.cssText = 'display: block;  min-height:60;';
							    		$scope.answerFirstCall();						    			
						    		}
				 		    	})
						    .catch( function(error) {
						    	console.log(error);
						    });
						    

						}, LISTENER_INTERVAL);
				}
					function _success(response) {
						$scope.errorMessage = false;
						$scope.connected = true;
						document.body.style.cursor = 'default';
					}

					function _error(response) {
						$scope.errorMessage = response.data;
						document.body.style.cursor = 'default';
					}

					$scope.showPopover = function() {
						$scope.popoverIsVisible = true;
					};

					$scope.hidePopover = function() {
						$scope.popoverIsVisible = false;
					};

					;
				});
