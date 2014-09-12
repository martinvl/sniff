# author Martin Vonheim Larsen and Staale Zerener Haugness for MAPS
# http://www.maps-uio.no/

import smtplib, time, socket, json, os
from email.mime.text import MIMEText

dirname = os.path.dirname(os.path.realpath(__file__))
config = json.load(open(dirname + '/config.json'))

SEND_ADDR       = "kassandra@hotmail.no"
RECV_ADDR       = "stdadmin@uio.no"
MSG_SUBJ        = "La meg fa ta eksamen, fittehorer!"
MSG_TXT         = """Hei, henviser til usaklig kjeft ang innleveringene mine.

Trenger dere alltid vare sa sykt Nazi? Greit, jeg leverte besvarelsen til Judit
pa tre av innleveringsoppgavene, men det var det jo mange som gjorde! Dessuten
var jo de innleveringene veldig bra, sa jeg skjonner ikke problemet.

Jeg er meg selv 100%, og det star jeg for. Dere far godta meg som jeg er.

Med 'vennlig' hilsen
Kassandra

'I never knew how to worship until I knew how to love.'"""

# create the message
msg = MIMEText(MSG_TXT)

msg['Subject'] = MSG_SUBJ
msg['From'] = SEND_ADDR
msg['To'] = RECV_ADDR

while True:
    # connect to mail server
    con = smtplib.SMTP(config['host'], config['port'])

    # send message
    con.sendmail(SEND_ADDR, RECV_ADDR, msg.as_string())

    con.quit()
    print "Mail sent."

    time.sleep(1)
