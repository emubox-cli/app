from utils.apps import exists, get_data
from utils.config import fetch, write
from utils.ez_http import request, get_releases, download_file
from utils.constants import EMUBOX_PATH, ASSET_URL, CONTAINER_PREFIX
from utils import cartridges
from json import dumps
from sys import exit
from pathlib import Path
from os import popen, environ, chmod
from stat import S_IRWXU

import time
import re

skip_precheck = False

async def exec(*args, **kwargs):
    config = fetch()
    for i in args:
        release_id = None
        if "@" in i:
            thing = i.split("@")
            i = thing[0]
            release_id = thing[1]
            print(f"Getting tag {release_id}...")
        
        if not exists(i):
            print(f"'{i}' not found")
            exit(1)
        
        if [ii for ii in config["installed"] if ii["id"] == i]:
            print(f"'{i}' already installed")
            exit(1)

        app = await get_data(i)
        

        release_data = await get_releases(app["installOptions"]["gitRepo"])
        latest = (release_data if not release_id else [i for i in release_data if i["tag_name"] == release_id])[0]

        target_asset = None
        try:
            target_asset = [i for i in latest["assets"] if re.match(app["installOptions"]["gitRe"], i["name"])][0]

        except:
            target_asset = [i for i in latest["assets"] if i["name"].lower().endswith(".appimage")][0]
            print("No asset found")
            # exit(1)

        exec_path = f"{EMUBOX_PATH}/apps/{target_asset['name']}"
        await download_file(target_asset["browser_download_url"], exec_path)
        chmod(exec_path, S_IRWXU)
        
        install_data = {
            "id": i,
            "exec": target_asset["name"],
            "releaseId": latest["id"]
        }

        config["installed"].append(install_data)
        write(config)

        cartridges.make_file(f"emu_{i}", app["name"], "run " + i)

        await download_file(
            f"{ASSET_URL}grids/{i}.tiff", 
            f"{EMUBOX_PATH}/.local/share/cartridges/covers/emu_{i}.tiff"
        )
