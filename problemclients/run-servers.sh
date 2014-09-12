#!/bin/bash

# this script needs sudo!
mkdir -p logs

node 2a/server.js &> logs/2a &
python 2b/server.py &> logs/2b &
node 2c/server.js &> logs/2c &
node 3a/server.js &> logs/3a &
node 3b/server.js &> logs/3b &

trap ctrl_c INT

function ctrl_c() {
    sudo killall node
    sudo killall python
}
