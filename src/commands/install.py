from utils.apps import exists, get_data
from utils.config import fetch, write
from utils.ez_http import request, get_releases, download_file
from utils.constants import EMUBOX_PATH
from sys import exit

import re

skip_precheck = False

async def exec(*args):
    config = fetch()
    print(config)
    for i in args:
        if not exists(i):
            print(f"'{i}' not found")
            exit(1)
        
        if [ii for ii in config["installed"] if ii["id"] == i]:
            print(f"'{i}' already installed")
            exit(1)

        app = await get_data(i)
        print(app)

        release_data = await get_releases(app["installOptions"]["gitRepo"])
        latest = release_data[0]

        target_asset = None
        try:
            target_asset = [i for i in latest["assets"] if re.match(app["installOptions"]["gitRe"], i["name"])][0]
        except:
            print("No asset found")
            exit(1)

        
        await download_file(target_asset["browser_download_url"], f"{EMUBOX_PATH}/apps/{target_asset['name']}")


        install_data = {
            "id": i,
            "exec": target_asset["name"],
            "releaseId": latest["id"]
        }

        config["installed"].append(install_data)

        write(config)

