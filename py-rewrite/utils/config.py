from utils.constants import EMUBOX_PATH
from os import path
from json import load

def fetch():
    data = {}
    with open(f"{EMUBOX_PATH}/config.json", "r") as p:
        data = load(p)

    return data

def exists():
    return path.exists(f"{EMUBOX_PATH}/config.json") 