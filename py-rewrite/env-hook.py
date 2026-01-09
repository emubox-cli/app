from os import environ as env
from datetime import datetime

# copied and filled in during "just build"...
env["EMUBOX_VERSION"] = "2.0"
env["BUILD_DATE"] = datetime.today().strftime('%Y%m%d%H%M%S')
