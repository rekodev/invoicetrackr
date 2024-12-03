#!/bin/bash

(cd client && pnpm run start) &
cd server && pnpm run start