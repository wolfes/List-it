/**
 * @filedesc Publisher & All the model's event types: model.EventType.X
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var model = model || {};

/**
 * Model's Publisher.
 */
model.publisher = _.extend({}, Backbone.Events);

model.EventType = {  
  UNDELETED_NOTES: 'undeleted-notes',

  NOTE_ADD: 'note-add',
  NOTE_SAVE: 'note-save',
  NOTE_DELETE: 'note-delete',

  NOTE_ORDER_CHANGE: 'note-order-change',

  NOTE_ORDER_UPDATE: 'note-order-update',
  BATCH_UPDATED_NOTES: 'batch-updated-notes',
  BATCH_INSERT_NOTES: 'batch-insert-notes',

  USER_VALIDATED: 'user-validated',
  USER_INVALID: 'user-invalid',
  SERVER_UNREACHABLE: 'server-unreachable',
  USER_LOGIN_STATUS: 'user-login-status',


  SYNC_SUCCESS: 'sync-success',
  SYNC_FAILURE: 'sync-failure',
  LOGOUT: 'logout',

  REGISTER_SUCCESS: 'register-success',
  REGISTER_FAILURE: 'register-failure',

  NEW_OPEN_HOTKEY: 'new-open-hotkey',
};
