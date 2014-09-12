# author Martin Vonheim Larsen and Staale Zerener Haugness for MAPS
# http://www.maps-uio.no/

import socket, time, json, os

dirname = os.path.dirname(os.path.realpath(__file__))
config = json.load(open(dirname + '/config.json'))
key = json.load(open(dirname + '/../keys.json'))[config['taskId']]

# inititalize UDP socket
sockfd = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# send packets to server
while True:
    sent_bytes = sockfd.sendto(key, (config['host'], config['port']))
    print "sent %d bytes" % sent_bytes

    time.sleep(1)
