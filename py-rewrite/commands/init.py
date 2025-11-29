from utils.constants import EMUBOX_PATH
from os import path, mkdir, rmdir, symlink, rename
from sys import exit

import re

skip_precheck = True

PATH_RE = r"^\/(?:[^/]+\/)*$"
DEFAULT_ROM_DIR = f"{EMUBOX_PATH}/roms"
DEFAULT_SAVE_DIR = f"{EMUBOX_PATH}/saves"


def exec(*args):

    new_config = {
        "installed": []
    }
    rom_dir = input("Please provide a rom directory. (Leave blank for default) ")
    update_rom_dir(rom_dir)
    new_config["romDir"] = "lmao"

def update_save_dir(save_dir: str):
    if save_dir == "":
        save_dir = DEFAULT_SAVE_DIR
    

def update_rom_dir(rom_dir: str):
    if rom_dir == "":
        rom_dir = DEFAULT_ROM_DIR

    if not re.search(PATH_RE, rom_dir):
        print("Invalid directory provided.")
        exit(1)

    if not path.exists(rom_dir) or not path.isdir(rom_dir):
        print("Directory not found.")
        exit(1)

    if rom_dir != DEFAULT_ROM_DIR:
        print("selected rom dir isn't default...")
        if path.exists(DEFAULT_ROM_DIR):
            print(f"{DEFAULT_ROM_DIR} already exists")
            if path.islink(DEFAULT_ROM_DIR):
                print("Symlink detected, safely removing")
                rmdir(DEFAULT_ROM_DIR)
            else:
                dex = 0
                while path.exists(f"{EMUBOX_PATH}/roms.bak{dex}"):
                    dex += 1
                print(f"Backing up existing rom folder to \"{EMUBOX_PATH}/roms.bak{dex}\"")
                rename(DEFAULT_ROM_DIR, f"{EMUBOX_PATH}/roms.bak{dex}")

        symlink(rom_dir, DEFAULT_ROM_DIR)
    else:
        mkdir(DEFAULT_ROM_DIR)
