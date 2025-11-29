from sys import exit, argv
from os import popen, path
from pathlib import Path

from commands import test, \
    init

def _is_ready():
    if not path.exists(f"{Path.home()}/.emubox/config.json"):
        print("Init required")
        exit(1)

    distrobox_check = popen("distrobox ls").read()
    if not "emubox" in distrobox_check:
        print("Emubox container is missing. Run the installer script again.")
        exit(1)

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

_is_ready()
target.exec(*extra)


