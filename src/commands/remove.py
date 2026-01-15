from utils.apps import exists, get_data
from utils.config import fetch, write
from utils.constants import EMUBOX_PATH
from sys import exit
from os import remove

skip_precheck = False

async def exec(*args, **kwargs):
    config = fetch()
    for i in args:
        if not await exists(i):
            print(f"'{i}' not found")
            exit(1)
        
        data = [ii for ii in config["installed"] if ii["id"] == i]
        if not data:
            print(f"'{i}' not installed")
            exit(1)
        data = data[0]

        remove(data['exec'])
        remove(f"{EMUBOX_PATH}/.local/share/cartridges/games/emu_{i}.json")

        config["installed"].remove(data)

        write(config)
