/**
 * @filedesc Model for Account Login/Registration.
 * Hastily moved in from Google Closure, could benefit from re-structuring.
 * 
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
L.make = L.make || {};
L.mode = L.mode || {};


/**
 * The Modes the Account Portal can be in.
 * @static (is this a property?)
 */
L.mode.account = {
  LOGIN: 'login',
  REGISTER: 'register'
};

L.make.AccountModel = Backbone.Model.extend({
  defaults: {
    mode: L.mode.account.LOGIN
  },
  initialize: function(data) {
    
  },


});
