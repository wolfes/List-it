/**
 * Create link to background's controller
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

// Set up controller link to background controller.
$(document).ready(function() {
  if (controller.isChromeExt()) {
    controller = chrome.extension.getBackgroundPage().controller;
  }
});
