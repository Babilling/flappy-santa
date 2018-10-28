#!/bin/bash
sed -i 's|8080|'"$PORT"'|g' flappybat/index.js
cd flappybat && npm install && node index.js
