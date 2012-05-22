/**
 * @filedesc Transparent connection from background Model to the View plus
 *  connection from view to background Controller.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

goog.provide('messenger');

/**
 * Port for messenger to talk to background page.
 * @private
 */
messenger.port_ = undefined;

/**
 * Sets up connection with background page under name: listit-options
 */
messenger.setupConnection = function() {
  debug('messenger.setupConnection()');
  // Connect to extension
  messenger.port_ = chrome.extension.connect({name: 'listit-options'});
  messenger.port_.onMessage.addListener(messenger.responseHandler);

  // Get sync success on setting up messengers.
  //setTimeout(controller.publishSyncSuccess, 30);
};

/**
 * DEPRECATED - DO NOT USE
 * Post Message on sidebar's port.
 * @param {string} methodName The name of the controller method to call.
 * @param {Object} opt_payload Optional payload to send with message.
 */
messenger.postMessage = function(methodName, opt_payload) {
  messenger.port_.postMessage({'methodName': methodName,
			       'payload': opt_payload});
};

/**
 * Publishes message from background page's model through pseudo-model.
 * @param {Object} msg The message object.
 */
messenger.responseHandler = function(msg) {
  var action = msg.action, payload = msg.payload;
  debug('Action:', action); //, 'Payload:', payload);
  model.publisher.publish(action, payload);
};
