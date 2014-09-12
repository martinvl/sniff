# Code from sniffing workshop
## Running the scoreboard
In order to run the scoreboard you need to have [node](http://nodejs.org)
installed.

Move to the `scoreboard` directory. Install all dependencies with `npm
install`. When the installation is complete run the server with `gulp prod`.
After all the building is finished (takes about a minute), you can see the
scoreboard by opening `http://localhost:5000` in a browser.

You can then find the problem text at `http://localhost:5000/problemtext.pdf`,
and the `arp_reply`-tool is at `http://localhost:5000/software.tar.gz`

## Running the task clients/servers
Each task has a client script and possibly a server script which provide the
traffic to sniff. These can be found in `problemclients`. See `install.sh`,
`run-*.sh` and `run-servers.sh` to get a clue about how these should be
installed/run.

Please post an issue if you have any questions or something isn't working.
