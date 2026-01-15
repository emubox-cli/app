from utils.constants import EMUBOX_PATH, SUPPORTED_CONSOLES
from utils.config import write
from os import path, mkdir, rmdir, symlink, rename, unlink
from sys import exit
from utils.apps import fetch_file
import json
from pathlib import Path

import re

skip_precheck = True

DEFAULT_ROM_DIR = f"{EMUBOX_PATH}/roms"
DEFAULT_SAVE_DIR = f"{EMUBOX_PATH}/saves"


async def exec(*_args, **_kwargs):
    if path.exists(f"{EMUBOX_PATH}/config.json"):
        print("Already initialized")
        exit(1)
    
    new_config = {
        "installed": []
    }
    rom_dir = input("Please provide a rom directory. (Leave blank for default) ") or DEFAULT_ROM_DIR
    update_rom_dir(rom_dir)
    new_config["romDir"] = rom_dir
    save_dir = input("Please provide a save directory. (Leave blank for default) ") or DEFAULT_SAVE_DIR
    update_save_dir(save_dir)
    new_config["saveDir"] = save_dir
    sgdb_token = input("If you have one, please provide a SteamGridDB API token. (This will be used to fetch art for games) ")
    new_config["sgdbToken"] = sgdb_token

    desktop_file = f"""\
[Desktop Entry]
Type=Application
Name=Cartridges (Emubox)
Exec={Path.home()}/.local/bin/emubox run-cartridges
Icon=page.kramo.Cartridges
Categories=Game;Emulator;
"""
    with open(f"{Path.home()}/.local/share/applications/emubox-cartridges.desktop", "w") as f:
        f.write(desktop_file)

    write(new_config)

def update_save_dir(save_dir: str):
    try:
        mkdir(save_dir)
    except:
        pass    

def update_rom_dir(rom_dir: str):
    if rom_dir != DEFAULT_ROM_DIR:
        print("selected rom dir isn't default...")
        if path.exists(DEFAULT_ROM_DIR):
            print(f"{DEFAULT_ROM_DIR} already exists")
            if path.islink(DEFAULT_ROM_DIR):
                print("Symlink detected, safely removing")
                unlink(DEFAULT_ROM_DIR)
            else:
                dex = 0
                while path.exists(f"{EMUBOX_PATH}/roms.bak{dex}"):
                    dex += 1
                print(f"Backing up existing rom folder to \"{EMUBOX_PATH}/roms.bak{dex}\"")
                rename(DEFAULT_ROM_DIR, f"{EMUBOX_PATH}/roms.bak{dex}")
                

        try:
            mkdir(rom_dir)
            for i in SUPPORTED_CONSOLES:
                mkdir(f"{rom_dir}/{i}")
        except:
            pass

        symlink(rom_dir, DEFAULT_ROM_DIR)
    else:
        try:
            mkdir(DEFAULT_ROM_DIR)
            for i in SUPPORTED_CONSOLES:
                mkdir(f"{DEFAULT_ROM_DIR}/{i}")
        except:
            pass
