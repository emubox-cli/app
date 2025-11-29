from sys import exit, argv
from os import popen, path, environ
from pathlib import Path

from utils import config
from commands import test, \
    init

def _precheck():
    if not config.exists():
        print("Init required")
        exit(1)
    
    distrobox_check = popen("distrobox ls").read()
    if not "emubox" in distrobox_check:
        print("Emubox container is missing. Run the installer script again.")
        exit(1)

if environ["EMUBOX_DEBUG"] == "1":
    print("DEBUGGING!")

command = ""
try:    
    command = argv[1]
except:
    print("No command provided...")
    exit(1)

extra = argv[2:]

COMMANDS = {
    "init": init,
    "test": test
}

target = COMMANDS.get(command)
if not target:
    print("Invalid command detected...")
    exit(1)

if not target.skip_precheck:
    _precheck()
target.exec(*extra)


