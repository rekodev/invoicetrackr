#!/bin/bash

(cd client && exec node server.js) &
client_pid=$!
(cd server && exec node dist/app.js) &
server_pid=$!

trap 'kill -TERM "$client_pid" "$server_pid" 2>/dev/null' TERM INT

wait -n
status=$?
kill -TERM "$client_pid" "$server_pid" 2>/dev/null
wait

exit $((status == 0 ? 1 : status))
