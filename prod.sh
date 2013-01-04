#!/bin/bash

if `cat index.html | grep "<!--11dev22-->" 1>/dev/null 2>&1` &&
   `cat index.html | grep "<!--22devprod33" 1>/dev/null 2>&1` &&
   `cat index.html | grep "33prod44-->" 1>/dev/null 2>&1`
then
  echo "Switching index.html to use sidebar_scripts.js"
  sed -i ".prod" -e "s|11dev22-->|11dev22|" -e "s|<!--22devprod33|22devprod33-->|" -e "s|33prod44|<!--33prod44|" index.html
  sed -i "" "s/DEBUG_MODE = true/DEBUG_MODE = false/" util.js
  sed -i "" "s/DEBUG_LOCAL = true/DEBUG_LOCAL = false/" background/server.js
  echo "Compiling Scripts & Packaging Extension"
  ./compileWolfe.sh
else
  echo "Comments around scripts in index.html mis-formed."
fi