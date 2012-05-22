/**
 * @filedesc Connection between background's controller and opened views.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var sidebar = sidebar || {};
sidebar.mgr = sidebar.mgr || {};

/**
 * Width of sidebar.
 * @private
 */
sidebar.mgr.width_ = 380;

/**
 * Map from child sidebar to parent window.
 * @private
 */
sidebar.mgr.child_to_parent_ = {};

/**
 * Map from a sidebar's parent window to child sidebar.
 * @private
 */
sidebar.mgr.parent_to_child_ = {};

/**
 * Map of (window id) --> to parent window information.
 * @private
 */
sidebar.mgr.parent_info_ = {};

/**
 * Map from sidebar port id to port object.
 */
sidebar.mgr.ports = {};

/**
 * Setup sidebar manager.
 */
sidebar.mgr.setup = function() {
  debug('sidebar.mgr.setup()');
  model.publisher.on(model.EventType.LOGOUT, function(msg) {
    // Close all sidebars.
    debug('CLOSE SIDEBARS AFTER LOGOUT');
    for (var childID in sidebar.mgr.child_to_parent_) {
      debug(childID, typeof(childID));
      sidebar.mgr.close(parseInt(childID, 10));
    }
  });
};

/**
 * Returns true of window is a sidebar, else false.
 * @param {number} winID The window id being asked about.
 * @return {boolean} Whether window is a sidebar.
 */
sidebar.mgr.isSidebar = function(winID) {
  return (sidebar.mgr.child_to_parent_[winID] !== undefined);
}; 

/**
 * Returns true of window is a sidebar's parent, else false.
 * @param {number} winID The window id being asked about.
 * @return {boolean} Whether window is a sidebar's parent.
 */
sidebar.mgr.isParent = function(winID) {
  return (sidebar.mgr.parent_to_child_[winID] !== undefined);
};

/**
 * Toggles sidebar visibility from a tab's request.
 * @param {Object} tab The tab sending the toggle request.
 */
sidebar.mgr.toggle = function(tab) {
  debug(tab);
  var winID = tab.windowId;

  // If we already know about this window, we want to close it
  if (sidebar.mgr.isParent(winID)) {
    sidebar.mgr.close(sidebar.mgr.parent_to_child_[winID]);
  } else if (sidebar.mgr.isSidebar(winID)) {
    sidebar.mgr.close(winID);
  } else {
    // We don't know about it, open new sidebar.
    chrome.windows.get(winID, sidebar.mgr.open);
  }
};

/**
 * Open sidebar with parent window.
 * @param {Object} win The parent window of the sidebar.
 */
sidebar.mgr.open = function(win) {
  // Allows sidebar to use more space than entirely overlapping parent window
  // TODO: Add as a setting!
  var allowDocking = true; 
  var width = sidebar.mgr.width_;
  
  var mainWindowFullWidth = screen.width === win.width;
  // Place sidebar as far left as possible
  // while still touching the parent window's left edge

  // Base case is for win.left < 0 (multiple monitors)
  var newSidebarLeft = win.left;
  var newParentWidth = win.width - width;
  if (win.left >= 0 && allowDocking) {
    newSidebarLeft = win.left - Math.min(win.left, width);
    newParentWidth = win.width - width - newSidebarLeft + win.left
  }

  chrome.windows.create({
    url: 'index.html',
    left: newSidebarLeft,
    top: win.top,
    width: width,
    height: win.height - 22, // For top "Title" bar of popup window.
    type: 'popup'
    },
    function (new_win) {
      sidebar.mgr.finishOpen_(new_win, win);
    }
  );

  // Record where parent window was located before resizing.
  sidebar.mgr.parent_info_[win.id] = {
    left: win.left, 
    width: win.width
  };
  
  // Resize parent window as little as possible, without moving the right edge.
  chrome.windows.update(win.id, {
    left: newSidebarLeft + width,
    width: win.width - width - newSidebarLeft + win.left,
    top: win.top, 
    height: win.height
  });
};

/**
 * Associate sidebar & parent window IDs once the sidebar is made.
 * @param {Object} win The sidebar window.
 * @param {Object} parent The parent window.
 * @private
 */
sidebar.mgr.finishOpen_ =  function(win, parent) {
  sidebar.mgr.parent_to_child_[parent.id] = win.id;
  sidebar.mgr.child_to_parent_[win.id] = parent.id;
};

/**
 * Close sidebar, remove associations, & resize parent window.
 * @param {number} winID The sidebar's window id.
 */
sidebar.mgr.close = function(winID) {
  if (!sidebar.mgr.isSidebar(winID)) {
    // Don't close non-sidebar windows.
    return;
  }
  // Remove Sidebar Window.
  var parentID = sidebar.mgr.child_to_parent_[winID];
  chrome.windows.remove(winID);

  // Reset parent window's size to original size.
  chrome.windows.update(parentID, sidebar.mgr.parent_info_[parentID]);

  // Remove Associations
  sidebar.mgr.child_to_parent_[winID] = undefined;
  sidebar.mgr.parent_to_child_[parentID] = undefined;
};

/**
 * Stores new port connection if it's a sidebar.
 */
sidebar.mgr.connect =  function(port) {
  if (port.name !== 'listit') { 
    return; // Listening for 'listit' ports only.
  }
  port.onMessage.addListener(function(msg) {
    sidebar.msg.responseHandler(msg, port);
  });
  
  sidebar.mgr.ports[port.portId_] = port;
  port.onDisconnect.addListener(function(e) {
    delete sidebar.mgr.ports[port.portId_];
  });
  
  // Publishes undeleted notes ASAP.
  controller.publishUndeletedNotes();
};
