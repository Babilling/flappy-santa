#!/bin/bash
sed -i 's|8080|'"$PORT"'|g' $FOLDER/index.js
cd flappybat && npm install && javascript-obfuscator ./public/js/ --output ./public/js/ && node index.js
