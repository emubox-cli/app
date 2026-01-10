from utils.config import fetch
from utils.ez_http import request, download_file
from utils import apps
from utils.constants import EMUBOX_PATH, SUPPORTED_CONSOLES
from utils.hash import match, encode
from urllib.parse import quote, quote_plus
from os import listdir, path, remove, readlink
from json import dumps
from PIL import Image
import time

skip_precheck = False

async def exec(*args):
    config = fetch()
    
    for iii in listdir(f"{EMUBOX_PATH}/.local/share/cartridges/games/"):
        if iii.split("_").pop(0) in SUPPORTED_CONSOLES:
            remove(f"{EMUBOX_PATH}/.local/share/cartridges/games/{iii}")
    
    
    for i in SUPPORTED_CONSOLES:
        rom_dir = f"{EMUBOX_PATH}/roms/{i}"
        if path.islink(rom_dir):
            rom_dir = readlink(rom_dir)
        
        if not path.isdir(f"{EMUBOX_PATH}/roms/{i}"):
            print("not a valid console?")
            continue

        roms = listdir(f"{EMUBOX_PATH}/roms/{i}")

        runner = [___i for ___i in apps.local["a"]if i in ___i["c"]]
        le_runner = None
        if len(runner) == 1:
            le_runner = runner[0]
        #print(f"{i}: {roms.__len__()}")
        for ii in range(len(roms)):
            rom = roms[ii]
            # not an actual hash of a game, just an identifier for game names
            rom_hash = encode(rom)
            runner_suffix = ""
            if le_runner and le_runner.get("e"):
                runner_suffix = f'run {le_runner['i']} {le_runner['e'].format(f"\"{EMUBOX_PATH}/roms/{i}/{rom}\"")}'
            #print(rom, rom_hash)
            dumbshit = {
                "added": int(time.time()),
                "blacklisted": False,
                "developer": None,
                "executable": f"/var/home/skullbite/Code/emubox/py-rewrite/dist/emubox-py {runner_suffix}",
                "game_id": f"{i}_{rom_hash}",
                "hidden": False,
                "last_played": 0,
                "name": rom,
                "source": "imported",
                "version": 1.5
            }

            if config.get("sgdbToken"):
                cartridges_cover_path = f"{EMUBOX_PATH}/.local/share/cartridges/covers/"
                cover_id = f"{i}_{rom_hash}"
                quick_check = [__i for __i in listdir(cartridges_cover_path) if cover_id in __i]
                if len(quick_check):
                    print(f"cover already downloaded for '{rom}', skipping...")
                else:
                    # print(f"getting art for {rom_hash}...")
                    headers = {"Authorization": f"Bearer {config['sgdbToken']}"}
                    names = await request(f"https://www.steamgriddb.com/api/v2/search/autocomplete/{quote(rom)}", headers)
                    if names["success"] and len(names["data"]):
                        da_game = names["data"][0]
                        grids = await request(f"https://www.steamgriddb.com/api/v2/grids/game/{da_game['id']}?dimensions=600x900", headers)
                        if not grids["success"] or not len(grids["data"]):
                            print(f"No grids found for '{rom}', skipping...")
                        else:
                            grid_url = grids['data'][0]['url']
                            grid_suffix = grid_url.split(".").pop()
                            da_path = f"{cartridges_cover_path}/{cover_id}.{grid_suffix}"
                            final_path = da_path.replace(grid_suffix, "tiff")
        
                            if not path.exists(final_path):
                                print("new icon downloading...")
                                await download_file(grid_url, da_path)
                                Image.open(da_path).save(final_path)
                                remove(da_path)

            with open(f"{EMUBOX_PATH}/.local/share/cartridges/games/{i}_{rom_hash}.json", "w") as f:
                f.write(dumps(dumbshit))

