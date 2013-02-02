#!/bin/bash

# Verify index.html using production compiled javascript files.
if `cat index.html | grep -E "^<!--11dev22" 1>/dev/null 2>&1` &&
   `cat index.html | grep -E "^22devprod33-->" 1>/dev/null 2>&1` &&
   `cat index.html | grep -E "^<!--33prod44-->" 1>/dev/null 2>&1`
then
  # Switch index.html to use dev js files.
  echo "Switching index.html to use development script files individually."
  sed -i ".dev" -e "s/11dev22/11dev22-->/" -e "s/22devprod33-->/<!--22devprod33/" -e "s/<!--33prod44/33prod44/" index.html
  sed -i "" "s/DEBUG_MODE = false/DEBUG_MODE = true/" util.js
  sed -i "" "s/DEBUG_LOCAL = false/DEBUG_LOCAL = true/" background/server.js
else
  echo "Comments around scripts in index.html mis-formed."
fi
