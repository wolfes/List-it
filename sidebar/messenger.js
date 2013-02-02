/**
 * Transparent connection from background Model to the View plus
 *  connection from view to background Controller.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var messenger = messenger || {};

/**
 * Port for messenger to talk to background page.
 * @private
 */
messenger.port_ = undefined;

/**
 * Sets up messenger's connection to background.
 */
messenger.setupConnection = function() {
  // Connect to extension
  messenger.port_ = chrome.extension.connect({name: 'listit'});
  messenger.port_.onMessage.addListener(messenger.responseHandler);
};
$(document).ready(function() {
  if (controller.isChromeExt()) {
    messenger.setupConnection();
  }
});

/**
 * DEPRECATED - Call controller directly instead.
 * Post Message on sidebar's port.
 * @param {string} methodName The name of the controller method to call.
 * @param {Object} opt_payload Optional payload to send with message.
 */
messenger.postMessage = function(methodName, opt_payload) {
  messenger.port_.postMessage({
    'methodName': methodName, 'payload': opt_payload
  });
};

/**
 * Publishes message from background page's model through pseudo-model.
 * @param {Object} msg The message object.
 */
messenger.responseHandler = function(msg) {
  var action = msg.action;
  var payload = msg.payload;
  debug('Msg type: ', action);
  //debug('Msg payload: ', payload);
  model.publisher.trigger(action, payload);
};
