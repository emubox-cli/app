from utils.config import fetch
from utils.apps import local
from utils.constants import EMUBOX_PATH, SUPPORTED_CONSOLES
from utils.hash import match, encode
from os import listdir, path, remove
from json import dumps
import time

skip_precheck = False

async def exec(*args):
    config = fetch()
    
    for iii in listdir(f"{EMUBOX_PATH}/.local/share/cartridges/games/"):
        if iii.startswith("emubox"):
            remove(f"{EMUBOX_PATH}/.local/share/cartridges/games/{iii}")
    
    
    for i in SUPPORTED_CONSOLES:
        if not path.isdir(f"{EMUBOX_PATH}/roms/{i}"):
            continue

        roms = listdir(f"{EMUBOX_PATH}/roms/{i}")
        runner = [i for i in local["a"]]
        print(local)
        print(f"{i}: {roms.__len__()}")
        for ii in range(len(roms)):
            rom = roms[ii]
            # not an actual hash of a game, just an identifier for game names
            rom_hash = encode(rom)
            print(rom, rom_hash)
            dumbshit = {
                "added": int(time.time()),
                "blacklisted": False,
                "developer": None,
                "executable": f"/var/home/skullbite/Code/emubox/py-rewrite/dist/emubox-py",
                "game_id": f"{i}_{ii}",
                "hidden": False,
                "last_played": 0,
                "name": f"{rom}",
                "source": "imported",
                "version": 1.5
            }

            with open(f"{EMUBOX_PATH}/.local/share/cartridges/games/emubox_{i}_{rom_hash}.json", "w") as f:
                f.write(dumps(dumbshit))

