#!/bin/bash

(cd server && exec node dist/app.js) &
server_pid=$!

trap 'kill -TERM "$server_pid" 2>/dev/null' TERM INT

for _ in $(seq 1 60); do
  if (exec 3<>"/dev/tcp/127.0.0.1/${SERVER_PORT}") 2>/dev/null; then
    break
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then
    wait "$server_pid"
    status=$?
    exit $((status == 0 ? 1 : status))
  fi
  sleep 1
done

(cd client && exec node server.js) &
client_pid=$!

trap 'kill -TERM "$client_pid" "$server_pid" 2>/dev/null' TERM INT

wait -n
status=$?
kill -TERM "$client_pid" "$server_pid" 2>/dev/null
wait

exit $((status == 0 ? 1 : status))
