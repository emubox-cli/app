from utils.constants import EMUBOX_PATH
from os import path
from json import load, dumps

def fetch() -> dict:
    data = {}
    with open(f"{EMUBOX_PATH}/config.json", "r") as p:
        data = load(p)

    return data

def exists() -> bool:
    return path.exists(f"{EMUBOX_PATH}/config.json") 
    

def app_installed(id: str) -> bool:
    conf = fetch()
    print(conf)

    return len([i for i in conf["installed"] if i["id"] == id]) != 0

def get_install_data(id: str) -> None[dict]:
    conf = fetch()

    data = [i for i in conf["installed"] if i["id"] == id]
    if not len(data):
        return None
    else:
        return data[0]

def write(new_config: dict):
    with open(f"{EMUBOX_PATH}/config.json", "w") as f:
        f.write(dumps(new_config, indent=4))