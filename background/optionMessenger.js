/**
 * @filedesc Messager for background's controller and sidebar views.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var options = options || {};

/**
 * Setup model subscribers to forward messages to front-end view.
 */
options.setupSubscribers = function() {
  chrome.extension.onConnect.addListener(function(port) {
    options.connect(port);
  });
  
  // Subscribe to login-only model events.

  options.subscribeToModel(model.EventType.USER_VALIDATED);
  options.subscribeToModel(model.EventType.USER_INVALID);
  options.subscribeToModel(model.EventType.SERVER_UNREACHABLE);
  options.subscribeToModel(model.EventType.USER_LOGIN_STATUS);
  

  options.subscribeToModel(model.EventType.SYNC_SUCCESS);
  options.subscribeToModel(model.EventType.SYNC_FAILURE);
  options.subscribeToModel(model.EventType.LOGOUT)

  options.subscribeToModel(model.EventType.REGISTER_SUCCESS);
  options.subscribeToModel(model.EventType.REGISTER_FAILURE);
  
  /*for (var modelEventType in model.EventType) {
    options.subscribeToModel(model.EventType[modelEventType]);
  }*/
};

/**
 * Stores Ports to open options pages.
 * @private
 */
options.ports_ = {};

/**
 * Adds listeners to 'listit-options' named connections.
 */
options.connect = function(port) {
  if (port.name !== 'listit-options') {
    return;
  }
  // Store options page port.
  options.ports_[port.portId_] = port;
  port.onMessage.addListener(function(msg) {
    options.responseHandler(msg, port);
  });
  port.onDisconnect.addListener(function(e) {
    delete options.ports_[port.portId_];
  });

  // Publishes Sync Status ASAP.
  //controller.publishSyncSuccess();
  controller.publishLoginState();
};

/**
 * Subscribes to model actions to send message to options page's messenger.
 * @param {string} action The model action to subscribe to.
 */
options.subscribeToModel = function(action) {
  model.publisher.on(action, function(payload) {
    options.broadcast({
      action: action,
      payload: payload
    });
  });
};

/**
 * Recieves messages from option views.
 * @param {Object} msg The message info object.
 * @param {Object} port The port from the sidebar that sent msg.
 */
options.responseHandler = function(msg, port) {
  var methodName = msg.methodName;
  var payload = msg.payload;
  
  if (methodName in controller) {
    controller.callControllerMethod(methodName, payload);
    return; // Done!
  }
};

/**
 * Broadcasts message to all open options pages.
 * @param {object} msg The message to transmit.
 */ 
options.broadcast = function(msg) {
  for (var portIndex in options.ports_) {
    debug('options.broadcast() w/ action:', msg.action);
    options.ports_[portIndex].postMessage(msg);
  }
};
