/**
 * Types of Activity Logs that can be stored in the Activity Log Table.
 *
 * @author wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};
/** Module Namespace */
db.logs = db.logs || {};

/**
 * Activity Log Type Enums
 */

// All Logs Record
// when INT - Date.now()
// action TEXT - ie: db.Logs.LogType.SIDEBAR_OPEN
// tabid INT - Unique id for tab list-it is open in (chrome ext only)
// noteid INT - Optional: Note action is related to, if any.
// info TEXT - json blob for action specific info
db.logs.LogType = {
  // Sidebar Interaction:
  SIDEBAR_OPEN: 'sidebar-open',
  // url Text - The url of last focused page (for ext only)
  // method Text - 'hotkey', 'browserAction'

  SIDEBAR_CLOSE: 'sidebar-close',
  // url Text - The url of last focused page (for ext only)
  // method Text - 'hotkey', 'browserAction'


  // Sidebar Opened & Note Creation box was auto-focused
  CREATE_AUTOFOCUS: 'create-autofocus',

  // Note Create Box Focuses:
  CREATE_FOCUS: 'create-focus',
  // tabid
  // url

  CREATE_SAVE: 'create-save', // info: click save button or shift-enter?
  // noteid
  // tabid
  // url text - The url of the last focused page (for ext only)
  // contents - The text of the note.
  // pinned boolean - If note is pinned.

  CREATE_CLEAR: 'create-clear',

  // Note Interaction:
  NOTE_EDIT: 'note-edit', // Note in list is selected
  // noteid int - The note's jid.
  // pinned boolean - True if selected note is pinned.

  NOTE_SAVE: 'note-save',
  // noteid int - The note's jid
  // pinned boolean - True if saved note is pinned.
  // url text - The url of the last focused page (for ext only)

  NOTE_DELETE: 'note-delete',
  // noteid int - The note's jid
  // pinned boolean - True if saved note is pinned.
  // url text - The url of the last focused page (for ext only)



  // Search Interaction
  SEARCH: 'search',
  // url Text - The url of the last focused page (for ext only)
  // terms Text - The search string
  // noteids List[int] - List of noteids matching search

  SEARCH_CLEAR: 'search-clear',


  // Note List Interaction:
  //ORDER_CHANGE: 'order-change',

  // Options Page Interaction:
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Special Commands:
  EXPAND: 'expand',
  // url text - The url of the last focused page (for ext only)
  SHRINK: 'shrink',
  // url text - The url of the last focused page (for ext only)

  BOOKMARK_OPEN: 'bookmark-open'
  // url text - The url the bookmark holds.
};



/*
   {u'clear-search': 8301,
   u'dashboard-PLAN-click': 3,
   u'diary-close': 989,
   u'diary-close-note': 1658,
   u'diary-filter-view': 6183,
   u'diary-inputsearch-focus': 4330,
   u'diary-open': 1634,
   u'diary-open-note': 4892,
   u'diary-set-note-font': 180,
   u'diary-set-note-height': 703,
   u'diary-set-note-width': 357,
   u'jv3.xul.login': 1856,
   u'link-clicked': 219,
   u'listit.xul.login': 1006,
   u'login': 104,
   u'note-add': 34700,
   u'note-delete': 30225,
   u'note-edit': 43133,
   u'note-purge': 4,
   u'note-save': 42603,
   u'note-undelete': 145,
   u'notecapture-focus': 125605,
   u'notes-reordered': 1318,
   u'poyozo-PLAN-item-click': 9,
   u'poyozo-blur': 92,
   u'poyozo-entity-small-click': 3,
   u'poyozo-focus': 94,
   u'poyozo-search': 41,
   u'poyozo-show-day-detail': 43,
   u'poyozo-tagcloud-click': 4,
   u'quick-input': 2390,
   u'rerank-mode-switch': 46,
   u'rerank-result': 19,
   u'search': 15716,
   u'searchbar-focus': 18615,
   u'sidebar-close': 47830,
   u'sidebar-open': 99230,
   u'significant-scroll': 624027,
   u'syncCommit': 3677,
   u'toggle-search': 3999,
   u'user-active-near-open-listit': 576919}
   */
