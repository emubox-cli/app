from utils.config import fetch
from utils.ez_http import request, download_file
from utils.constants import EMUBOX_PATH, CARTRIDGES_PATH, SUPPORTED_CONSOLES
from utils.hash import encode
from utils import cartridges
from urllib.parse import quote, quote_plus
from pathlib import Path
from os import listdir, path, remove, readlink, makedirs, environ
from json import dumps
from PIL import Image

import time, re

skip_precheck = False

async def exec(*args, **kwargs):
    config = fetch()
    
    # for iii in listdir(f"{EMUBOX_PATH}/.local/share/cartridges/games/"):
    #    if iii.split("_").pop(0) in SUPPORTED_CONSOLES:
    #        remove(f"{EMUBOX_PATH}/.local/share/cartridges/games/{iii}")

    handled_launchers = []

    try:
        makedirs(f"{CARTRIDGES_PATH}/games")
    except:
        pass
    
    
    for i in SUPPORTED_CONSOLES:
        rom_dir = f"{EMUBOX_PATH}/roms/{i}"
        if path.islink(rom_dir):
            rom_dir = readlink(rom_dir)
        
        if not path.isdir(f"{EMUBOX_PATH}/roms/{i}"):
            print(f"{i}: Invalid path(?)")
            continue
        print(f"Parsing roms in {i}...")

        roms = listdir(f"{EMUBOX_PATH}/roms/{i}")

        # TODO: Make this readable
        runner = [___i for ___i in kwargs["apps"]["a"] if i in ___i["c"]]
        runner_ids = [___i["i"] for ___i in runner]
        config_ids = [___i["id"] for ___i in config["installed"]]
        le_runner = None

        for __i in runner_ids:
            if __i in config_ids:
                le_runner = __i
                break
        
        if not le_runner == None:
            le_runner = [ii for ii in runner if ii["i"] == le_runner][0]

        #print(f"{i}: {roms.__len__()}")
        for ii in range(len(roms)):
            rom = roms[ii]
            if not le_runner:
                print("No runner availible for game...")
                continue
            if not re.match(le_runner['r'], rom):
                print("Not a valid rom:", rom)
                continue
            display_name = rom
            # not an actual hash of a game, just an identifier for game names
            rom_hash = encode(rom)
            rom_launcher = f"{i}_{rom_hash}"
            handled_launchers.append(rom_launcher + ".json")
            cartridges_file_path = f"{CARTRIDGES_PATH}/games/{rom_launcher}.json"
            if path.exists(cartridges_file_path):
                continue
            runner_suffix = ""
            if le_runner and le_runner.get("e"):
                runner_suffix = f'run {le_runner['i']} {le_runner['e'].format(f"\"{EMUBOX_PATH}/roms/{i}/{rom}\"")}'
            else:
                print("No apps availiable to run...")
            #print(rom, rom_hash)
            dumbshit = {
                "added": int(time.time()),
                "blacklisted": False,
                "developer": None,
                "executable": f"{environ['PWD'] + '/dist' if environ["EMUBOX_DEBUG"] == "1" else (str(Path.home()) + "/.local/bin")}/emubox {runner_suffix}",
                "game_id": rom_launcher,
                "hidden": False,
                "last_played": 0,
                "name": rom,
                "source": "imported",
                "version": 1.5
            }
            

            if config.get("sgdbToken"):
                cartridges_cover_path = f"{CARTRIDGES_PATH}/covers/"
                try:
                    makedirs(cartridges_cover_path)
                except:
                    pass
                quick_check = [__i for __i in listdir(cartridges_cover_path) if rom_launcher in __i]
                if len(quick_check):
                    print(f"Cover already downloaded for '{rom}', skipping...")
                else:
                    # print(f"getting art for {rom_hash}...")
                    headers = {"Authorization": f"Bearer {config['sgdbToken']}"}
                    names = await request(f"https://www.steamgriddb.com/api/v2/search/autocomplete/{quote(rom)}", headers)
                    if names["success"] and len(names["data"]):
                        da_game = names["data"][0]
                        display_name = da_game["name"]
                        grids = await request(f"https://www.steamgriddb.com/api/v2/grids/game/{da_game['id']}?dimensions=600x900", headers)
                        if not grids["success"] or not len(grids["data"]):
                            print(f"No grids found for '{rom}', skipping...")
                        else:
                            grid_url = grids['data'][0]['url']
                            grid_suffix = grid_url.split(".").pop()
                            da_path = f"{cartridges_cover_path}/{rom_launcher}.{grid_suffix}"
                            final_path = da_path.replace(grid_suffix, "tiff")
        
                            if not path.exists(final_path):
                                print("Downloading new grid...")
                                await download_file(grid_url, da_path)
                                Image.open(da_path).save(final_path)
                                remove(da_path)
                    else:
                        print("SteamGridDB request failed! Is your API token valid?")
                                

            cartridges.make_file(rom_launcher, display_name, runner_suffix)
    for i in listdir(f"{CARTRIDGES_PATH}/games"):
        is_rom = [ii for ii in SUPPORTED_CONSOLES if i.startswith(ii)]
        if not is_rom:
            print("Skipping", i)
            continue

        if i not in handled_launchers:
            print("ROM has left been unhandled, queued", i, "for deletion")
            remove(f"{CARTRIDGES_PATH}/games/{i}")