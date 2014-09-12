# author Martin Vonheim Larsen and Staale Zerener Haugness for MAPS
# http://www.maps-uio.no/

import ftplib, socket, time, json, os

TIMEOUT = 10
dirname = os.path.dirname(os.path.realpath(__file__))
config = json.load(open(dirname + '/config.json'))

# create FTP connection
con = ftplib.FTP()

while True:
    try:
        # connect and log on to server
        con.connect(config['host'], config['port'], TIMEOUT)
        con.login(config['user'], config['password'])

        print "connected"
        time.sleep(1)

        con.quit()
    except socket.timeout:
        print "connection timeout, reconnecting..."
