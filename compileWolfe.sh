#!/bin/bash
export BASH_ENV="~/.bash_profile"

# Compile all scripts into sidebar_scripts.js

java -jar GoogCompiler.jar --js lib/jquery-1.7.2.min.js lib/jquery-ui-1.8.20.sort.min.js lib/underscore-1.3.3.js lib/underscore-string.js lib/backbone.js lib/doT.js lib/json2.js util.js sidebar/templates.js background/shortcut.js shared/enums.js background/storeNotes.js background/storeLogs.js background/dbInfo.js background/model.js background/server.js background/controller.js background/controllerAccess.js sidebar/messenger.js sidebar/settings.js sidebar/metatype.js sidebar/accountview.js sidebar/varsmodel.js sidebar/optionsmodel.js sidebar/optionsview.js sidebar/optioncol.js sidebar/optionrow.js sidebar/omniboxmodel.js sidebar/omniboxview.js sidebar/statusMsg.js sidebar/noteview.js sidebar/notemodel.js sidebar/NoteCol.js sidebar/notelistviews.js sidebar/views.js  --js_output_file sidebar_scripts.js --compilation_level WHITESPACE_ONLY;

# Remove previous extension, package new extension.

rm /Users/wolfe/listit/list-it/src/deploy/listit_chrome.crx;

crxmake --pack-extension=/Users/wolfe/listit/list-it/src/app --extension-output=/Users/wolfe/listit/list-it/src/deploy/listit_chrome.crx --pack-extension-key=/Users/wolfe/listit/list-it/src/private_chrome_key.pem;

grep 'DEBUG_' */*