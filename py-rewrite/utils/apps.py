from os import path
from json import loads, load, dumps
from utils.constants import EMUBOX_PATH, ASSET_URL
from utils.ez_http import request

local = { "v": "", "a": [] } 

async def fetch_file():
    global local

    data = None
    
    if path.exists(f"{EMUBOX_PATH}/apps.json"):
        print("apps.json exists")
        if path.exists(f"{EMUBOX_PATH}/apps.json"):
            with open(f"{EMUBOX_PATH}/apps.json") as f:
                print("loading apps.json file")
                 
                data = loads(f.read())
    else:
        data = await request(f"{ASSET_URL}/apps.json")

        with open(f"{EMUBOX_PATH}/apps.json", "w") as f:
            f.write(dumps(local))

    local = data
    
def exists(id: str) -> bool:
    for i in local.get("a"):
        if i.get("i") == id:
            return True
    return False

async def get_data(id: str):
    if not exists(id):
        raise Exception("No app to get!")

    app_data = await request(f"{ASSET_URL}/{id}.json")
    return app_data
    

