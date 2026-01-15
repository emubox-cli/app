from pathlib import Path
from os import environ

_debug_suffix = ("-debug" if environ["EMUBOX_DEBUG"] == "1" else "")
EMUBOX_PATH = f"{Path.home()}/.emubox" + _debug_suffix
if ".emubox" in str(Path.home()):
    EMUBOX_PATH = str(Path.home()) 

IN_DISTROBOX = str(Path.home()) == EMUBOX_PATH
CONTAINER_PREFIX = "distrobox enter emubox" + _debug_suffix + " -- "
if IN_DISTROBOX:
    CONTAINER_PREFIX = ""
ASSET_URL = "https://emubox-cli.github.io/apps/"

CARTRIDGES_PATH = f"{EMUBOX_PATH}/.local/share/cartridges"

# TODO: more supported consoles
SUPPORTED_CONSOLES = (
    "snes",
    "gba",
    "n64",
    "nds",
    "gc",
    "wii",
    "wiiu",
    "3ds",
    "switch",
    "psp",
    "psx",
    "ps2",
    "ps3"
)


