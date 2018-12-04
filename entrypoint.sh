#!/bin/bash
sed -i 's|8080|'"$PORT"'|g' flappysanta/index.js
cd flappysanta && npm install && npm link javascript-obfuscator && javascript-obfuscator ./public/js/ --output ./public/js/ && node index.js > flappysanta.log
