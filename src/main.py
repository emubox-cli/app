import pip_system_certs.wrapt_requests
pip_system_certs.wrapt_requests.inject_truststore()


from sys import exit, argv
from os import popen, path, environ, listdir
from pathlib import Path
import asyncio, traceback

from utils import config, constants
from commands import test, \
    init, \
    run, \
    install, \
    sync, \
    remove, \
    run_cartridges
    
from utils import apps

async def _precheck():
    # print("updated app file", apps.local)
    if not config.exists():
        print("Init required")
        exit(1)
    
    if constants.IN_DISTROBOX:
        return

    distrobox_check = popen("distrobox ls").read()
    if not "emubox" in distrobox_check:
        print("Emubox container is missing. Run the installer script again.")
        exit(1)

if environ["EMUBOX_DEBUG"] == "1":
    print("DEBUG BUILD -", environ["BUILD_DATE"])

command = ""
try:    
    command = argv[1]
except:
    print("No command provided...")
    exit(1)

extra = argv[2:]

COMMANDS = {
    "init": init,
    "test": test,
    "run-cartridges": run_cartridges,
    "run": run,
    "sync": sync,
    "install": install,
    "remove": remove
}

target = COMMANDS.get(command)
if not target:
    print("Invalid command detected...")
    exit(1)

async def run_command():
    if not target.skip_precheck:
       await _precheck()
    try:
        apps_file = await apps.fetch_file()
        await target.exec(*extra, apps=apps_file)
    except Exception:
        print("An issue occured while running the command;", traceback.format_exc())

asyncio.run(run_command())