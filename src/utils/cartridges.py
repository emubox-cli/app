import time
from utils.constants import EMUBOX_PATH
from os import environ, path
from pathlib import Path
from json import dumps

def make_file(id: str, name: str, exec: str = ""):
    dumbshit = {
        "added": int(time.time()),
        "blacklisted": False,
        "developer": None,
        "executable": f"{Path.home()}/.local/bin/emubox {exec}",
        "game_id": id,
        "hidden": False,
        "last_played": 0,
        "name": name,
        "source": "imported",
        "version": 1.5
    }

    with open(f"{EMUBOX_PATH}/.local/share/cartridges/games/{id}.json", "w") as f:
        f.write(dumps(dumbshit))


def exists(id: str):
    return path.exists(f"{EMUBOX_PATH}/.local/share/cartridges/games/{id}.json")
