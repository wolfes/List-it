var L = L || {};
/** Template Namespace */
L.template = L.template || {};

//L.template.note = ;

/** CHROME Note Template */
L.template.webkitNote = doT.template(
'<div class="note hbox" name="note" id="{{=it.jid }}">' +
'<div class="left grabable">' +
  '<img src="{{=it.leftIcon }}">' +
'</div>' +
'<div class="middle flex">' +
  '<div contenteditable="" class="noteContents"' +
    'id="{{=it.jid }}_text" style="height: {{=it.height}}; ">' +
    '{{=it.contents }}' +
  '</div>' +
'</div>' +
'<div class="right">' +
  '<img class="xIcon clickable" style="display:none" src="img/x.png">' +
'</div></div>');

/** FIREFOX Note Template */
L.template.firefoxNote = doT.template(
'<div class="note hbox" name="note" id="{{=it.jid }}">' +
'<div class="left grabable">' +
  '<img src="{{=it.leftIcon }}">' +
'</div>' +
'<div class="middle flex">' +
  '<div contenteditable="" class="noteContents"' +
    'id="{{=it.jid }}_text" style="height: {{=it.height}}; ">' +
    '{{=it.contents }}' +
  '</div>' +
'</div>' +
'<div class="right">' +
  '<img class="xIcon clickable" style="display:none" src="img/x.png">' +
'</div></div>');


/** IconRow for Input Box */
L.template.iconrow = doT.template(
'<div class="iconRow hbox">' +
'  <div class="iconTab box center_box">' +
    '<img id="eye-icon" src="img/pin_plus.png"' +
    'title="Keep this note at the top of my list.">' +
  '</div>' +
  '<div id="save-icon" class="iconTab box center_box">' +
    '<img src="img/plus.png" title="Save this note!">' +
  '</div>' +
'</div>');

/** Note Creation Box */
L.template.input = doT.template(
'<div id="new-note">' +
  '<div id="new-note-desc" class="flex">Search or Create Note</div>' +
  '<div id="new-note-entry" class="input-div flex" contenteditable=""></div>' +
  '{{#L.template.iconrow()}}' +
'</div>');

/** Options Column */
L.template.optioncol = doT.template(
'<div id="iconContainer">' +
  '<img id="syncIcon" class="settingIcon" src="img/arrowstill.png"' +
  'width="16px" height="16px" title="Save a backup copy of your notes' +
  'on our server.">' +
  '<img id="optionsIcon" class="settingIcon"' +
  'src="img/settings_white.png" width="16px" height="16px"' +
  'title="View Options and Login to save a backup of your notes.">' +
  '<img id="shrinkIcon" class="settingIcon"' +
  'src="{{=it.sizeIcon }}" width="16px" height="16px"' +
  'title="Minimize Notes">' +
'</div>');

/** Options View (Feature Toggles in Settings Page) */
L.template.optionview = doT.template(
  '<div>' +
  '<span class="itemTitle"> Default Settings </span>' +
  '<input {{=it.checkShrink}} type="checkbox" name="shrink" id="shrink" /> &nbsp;' +
  '<label for="shrink">Shrink notes when opening sidebar.</label>' +
  '<input type="text" name="openHotkey" id="openHotkey" value="{{=it.openHotkey}}" /> &nbsp;' +
  '<label for="openHotkey"><input id="saveOpenHotkey" type="button" value="Save: Open Sidebar Hotkey."/></label>' +
  '</div>'
);

/*L.template.optionrow = doT.template(
  '<div id="optionrow">' +
  '{{~it.savedSearch :value:index}}' +
  '<div>{{=value}}!</div>' +
  '{{~}}' +
  '</div>'
);*/

/*L.template.savedsearch = doT.template(

);*/
