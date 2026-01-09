from utils import config
from utils.constants import CONTAINER_PREFIX, EMUBOX_PATH
from os import system
from sys import exit

skip_precheck = False

async def exec(*args):
    if not config.app_installed(args[0]):
        print("NOT AVAILIBLE")
        exit(1)

    emu_data = config.get_install_data(args[0])
    print(args[1:])

    system(f"{CONTAINER_PREFIX}{EMUBOX_PATH}/apps/{emu_data['exec']}")