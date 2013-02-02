/**
 * Model for Account Login/Registration.
 * Hastily moved in from Google Closure, could benefit from re-structuring.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
/** Maker namespace. */
L.make = L.make || {};
/** Mode namespace. */
L.mode = L.mode || {};


/**
 * The Modes the Account Portal can be in.
 * @const
 */
L.mode.account = {
  LOGIN: 'login',
  REGISTER: 'register'
};

/**
 * Make account model.
 * TODO(wstyke:02/01/2013): Finish implementing this!
 */
L.make.AccountModel = Backbone.Model.extend({
  defaults: {
    mode: L.mode.account.LOGIN
  },
  initialize: function(data) {
  }
});
