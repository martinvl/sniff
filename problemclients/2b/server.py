# author Martin Vonheim Larsen and Staale Zerener Haugness for MAPS
# http://www.maps-uio.no/

import smtpd, asyncore, socket, json, os

dirname = os.path.dirname(os.path.realpath(__file__))
config = json.load(open(dirname + '/config.json'))

class SniffServer(smtpd.SMTPServer):
    def process_message(self, peer, mailfrom, rcpttos, data):
        print '2b: received message from:', peer
        return

# initate SMTP server
server = SniffServer((config['host'], config['port']), None)
print '2b: server started at port %d' % config['port']

# run server in loop
asyncore.loop()
