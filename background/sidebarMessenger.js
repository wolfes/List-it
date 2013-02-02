/**
 * Messager for background's controller and sidebar views.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var sidebar = sidebar || {};

/** Module Namespace */
sidebar.msg = sidebar.msg || {};

/**
 * Setup all model subscribers to forward messages to front-end view.
 */
sidebar.msg.setupSubscribers = function() {
  // Add Extension Open/Close Listeners
  chrome.browserAction.onClicked.addListener(sidebar.mgr.toggle);
  chrome.windows.onRemoved.addListener(sidebar.mgr.close);

  // Add new port listener for sidebars.
  chrome.extension.onConnect.addListener(function(port) {
    sidebar.mgr.connect(port);
  });

  // Subscribe to ALL model messages, never need to change this.
  for (var modelEventType in model.EventType) {
    sidebar.msg.subscribeToModel(model.EventType[modelEventType]);
  }
};


/**
 * Recieves messages from sidebar views.
 * @param {Object} msg The message info object.
 * @param {Object} port The port from the sidebar that sent msg.
 */
sidebar.msg.responseHandler = function(msg, port) {
  debug('sidebar.msg.responseHandler( ', msg);
      var methodName = msg.methodName;
      var payload = msg.payload;

      if (methodName in controller) {
        controller.callControllerMethod(methodName, payload);
        return; // Done!
      }
      };

      /**
       * Subscribes to model actions to send message to sidebar messenger.
       * @param {string} action The model action to subscribe to.
       */
      sidebar.msg.subscribeToModel = function(action) {
        model.publisher.on(action, function(payload) {
          sidebar.msg.broadcast({
            action: action,
            payload: payload
          });
        });
      };

/**
 * Broadcast message to all sidebar ports.
 * @param {Object} msg The message to broadcast.
 */
sidebar.msg.broadcast = function(msg) {
  //debug('sidebar.msg.broadcast msg: ', msg);
  for (var portIndex in sidebar.mgr.ports) {
    sidebar.mgr.ports[portIndex].postMessage(msg);
  }
};

/**
 * Broadcast message to all sidebar ports except one.
 * @param {Object} msg The message to broadcast.
 * @param {Object} portid The port to exclude.
 */
sidebar.msg.broadcastButSender = function(msg, portid) {
  for (var portIndex in sidebar.mgr.ports) {
    if (sidebar.ports[portIndex].portId_ !== portid) {
      sidebar.ports[portIndex].postMessage(msg);
    }
  }
};
