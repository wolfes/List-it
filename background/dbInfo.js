/**
 * Contains extra information storage sub-system of Model.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};

/** Module Namespace */
db.info = db.info || {};

/**
 * Setup info database.
 */
db.info.setup = function() {
  // Currently not called anywhere.
};

/**
 * Sets user's hashed password.
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 */
db.info.setUserLoginData = function(email, password) {
  // from:coderseye.com/2007/how-to-do-http-basic-auth-in-ajax.html
  hashpass = util.makeHashpass(email, password);
  window.localStorage.setItem('email', email);
  window.localStorage.setItem('hashpass', hashpass);
};

/**
 * Returns whether user is logged in.
 * @return {boolean} loggedIn True if user is logged in.
 */
db.info.isUserLoggedIn = function() {
  var loggedIn = (null !== window.localStorage.getItem('hashpass'));
  return loggedIn;
};


/**
 * Get's user's email.
 * @return {string} The user's email.
 */
db.info.getUserEmail = function() {
  return window.localStorage.getItem('email');
};

/**
 * Gets user's hashed username + password.
 * @return {string} The user's hashpass.
 */
db.info.getUserHashPass = function() {
  return window.localStorage.getItem('hashpass');
};


/**
 * Sets user's Couhes status.
 * @param {boolean} couhes True if user participating in study.
 */
db.info.setUserCouhes = function(couhes) {
  window.localStorage.setItem('couhes', couhes);
};

/**
 * Gets user's Couhes status.
 * @return {boolean} True if user participating in couhes study.
 */
db.info.getUserCouhes = function() {
  return 'true' === window.localStorage.getItem('couhes');
};


/**
 * Sets whether last sync attempt was successful.
 * @param {boolean} syncSuccess True if last sync worked.
 */
db.info.setSyncSuccess = function(syncSuccess) {
  window.localStorage.setItem('syncSuccess', syncSuccess);
};

/**
 * Gets whether last attempted sync was successful.
 * @return {boolean} True if last sync was successful.
 */
db.info.getSyncSuccess = function() {
  return 'true' === window.localStorage.getItem('syncSuccess');
};


/**
 * Clears user information: email, hashpass, couhes.
 */
db.info.clearUserInfo = function() {
  window.localStorage.removeItem('email');
  window.localStorage.removeItem('hashpass');
  window.localStorage.removeItem('couhes');
  window.localStorage.removeItem('syncSuccess');
  window.localStorage.removeItem('validation');
};
