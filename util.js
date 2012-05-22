// Author: Wolfe Styke
// Utility Functions that span most/all files

var util = util || {};

/**
 * Global setting for allowing debug messages.
 * Localhost:8000 defaults to true, otherwise false.
 * @type {boolean}
 * @private
 */
DEBUG_MODE = (typeof window.location.host === 'string' &&
	      window.location.host.search(':8000') !== -1);
//DEBUG_MODE = true; 

/**
 * Prints arguments if debugging is on 
 * and window.console is available.
 */

window.debug = function() {};

if (DEBUG_MODE && window.console) {
  window.debug = function(){
    console.log.apply(console, arguments);
  }
}
/*
function debug() {
  if (DEBUG_MODE && window.console) {
    console.log.apply(console, arguments);
  }
}*/


/**
 * Sets cursor at end of content editable element.
 * @param contentEditableElement
 * @see Geowa4's soln: http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
 */
function setCursorAtEnd(contentEditableElement) {
  var range,selection;
  if (document.createRange) {//Firefox, Chrome, Opera, Safari, IE 9+
    //Create a range (a range is a like the selection but invisible)
    range = document.createRange();

    //Select the entire contents of the element with the range
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);//collapse the range to the end point. 
    //false means collapse to end rather than the start

    //get the selection object (allows you to change selection)
    selection = window.getSelection();
    selection.removeAllRanges(); //remove any selections already made
    //make the range you have just created the visible selection
    selection.addRange(range);

  } else if(document.selection) {//IE 8 and lower
    //Create a range (a range is a like the selection but invisible)
    range = document.body.createTextRange();
    //Select the entire contents of the element with the range
    range.moveToElementText(contentEditableElement);
    //collapse the range to the end point. false means collapse to end rather than the start
    range.collapse(false);
    range.select();//Select the range (make it the visible selection
  }
}

/**
 * Returns host from url string, else "" if failed to find host.
 * @param {string} url The url string.
 * @return {string} The host part of the url string.
 */
function getHostname(url) {
  var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
  var matches = url.match(re);
  var result = ""
  if (matches != null && matches.length >= 2) {
    result = matches[1].toString();
  }
  return result;
}

/**
 * Maps "true", true, '1', 1 -> 1.  
 * Maps 'false', false', '0', 0 -> 0.
 * @param {string, number}
 */
function getDeletedVal(delVal) {
  var del = 0;
  if (delVal === true || delVal === 'true' || delVal === '1' || delVal === 1) {
    del = 1;
  } 
  return del;
}

/**
 * Returns hashpass from email and password combo.
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 */
util.makeHashpass = function(email, password) {
  var token = email + ':' + password;
  var hashpass = 'Basic ' + encodeBase(token);
  hashpass = encodeURIComponent(hashpass);
  return hashpass;
};

/**
 * Fixed version of SlideUp/SlideDown, no 'jump'.
 * @param {object} el The dom element
 * @param {boolean} toShow True to show element, False to hide.
 * @param {number} duration Number of msec to animate.
 * @param {function} opt_continuation No-param fn after animation completion.
 * @see http://blog.pengoworks.com/index.cfm/2009/4/21/Fixing-jQuerys-slideDown-effect-ie-Jumpy-Animation
 */
function slideToggle(el, toShow, duration, opt_continuation) {
  var elt = $(el);
  var height = elt.data('originalHeight');
  var visible = elt.is(':visible');
  
  // if the toShow isn't present, get the current visibility and reverse it
  if (arguments.length === 1) toShow = !visible;
  
  // if the current visiblilty is the same as the requested state, cancel
  if (toShow == visible) return false;
  
  // get the original height
  if (!height) {
    // get original height
    height = elt.show().height();
    // update the height
    elt.data('originalHeight', height);
    // if the element was hidden, hide it again
    if (!visible) elt.hide().css({height: 0});
  }

  // expand the knowledge (instead of slideDown/Up, use custom animation which applies fix)
  if (toShow) {
    elt.show().animate({height: height}, {
      duration: duration,
      complete: function() {
	if (opt_continuation !== undefined) {
	  opt_continuation();
	}
      }
    });
  } else {
    elt.animate({height: 0}, {
      duration: duration, 
      complete: function (){
	elt.hide();
	if (opt_continuation !== undefined) {
	  opt_continuation();
	}
      }
    });
  }
}





/**
 * Debugging method for quickly getting an element by it's id.
 * @param {string, number} id A string or number DOM element id.
 * @param {object} The dom element with given id, or undefined.
 */
function gid(id) {
  return document.getElementById(id);
}




/***  Base64 encode / decode http://www.webtoolkit.info/ * **/
keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/**
 * Public method for encoding a string.
 * @param {string} string The string to encode.
 * @return {string} utftext The encoded string.
 */
function utfEncode(string)  {
  string = string.replace(/\r\n/g,'\n');
  var utftext = '';

  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

/**
 * Encodes string in base64.
 * @param {string} input The string to encode.
 * @return {string} output The encoded string.
 */
function encodeBase(input) {
  var output = '';
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  input = utfEncode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}
