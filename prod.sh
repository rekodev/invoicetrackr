#!/bin/bash

(cd client && node server.js) &
cd server && node dist/app.js
