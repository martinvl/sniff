# author Martin Vonheim Larsen and Staale Zerener Haugness for MAPS
# http://www.maps-uio.no/

import httplib, time, socket, json, os

TIMEOUT = 2
dirname = os.path.dirname(os.path.realpath(__file__))
config = json.load(open(dirname + '/config.json'))
config['hosts'].append(json.load(open(dirname + '/../keys.json'))[config['taskId']])

cons = {}

while True:
    for path in config['hosts']:
        if not path in cons:
            # create connection if it doesn't exist
            cons[path] = httplib.HTTPConnection(path, timeout=TIMEOUT)

        con = cons[path]

        # fetch page
        try:
            con.request("GET", "/")
            time.sleep(1)

            resp = con.getresponse()

            if resp.status == httplib.OK:
                resp_data = resp.read()
                print "fetched", path
                continue

            # there were an error fetching
            if resp.status == httplib.REQUEST_TIMEOUT:
                # connection timed out
                print 'connection timed out, reconnecting...'
            else:
                # failed to fetch page
                print 'fetch fail', resp.status, resp.reason
        except (httplib.BadStatusLine, socket.error, socket.timeout):
            print 'fetch fail, could not connect to server, reconnecting...'

        # reset connection, since there were an error
        del cons[path]
        break
