from os import makedirs
from constants import EMUBOX_PATH, CARTRIDGES_PATH

def ensure():
    HOME_FOLDERS = [".local/share", ".config", "apps"]
    for i in HOME_FOLDERS:
        makedirs(f"{EMUBOX_PATH}/{i}")

    CARTRIDGES_FOLDERS = ["games", "covers"]
    for i in CARTRIDGES_FOLDERS:
        makedirs(f"{CARTRIDGES_PATH}/{i}")