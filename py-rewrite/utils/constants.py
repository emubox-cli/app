from pathlib import Path
from os import environ

_debug_suffix = ("-debug" if environ["EMUBOX_DEBUG"] == "1" else "")
EMUBOX_PATH = f"{Path.home()}/.emubox" + _debug_suffix
CONTAINER_PREFIX = "distrobox enter emubox" + _debug_suffix + " -- "
ASSET_URL = "https://emubox-cli.github.io/apps/"

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


