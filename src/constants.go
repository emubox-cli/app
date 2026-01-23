package main

import (
	"os"
	"path/filepath"
)

var HOME_DIR, _ = os.UserHomeDir()
var EMUBOX_PATH = filepath.Join(HOME_DIR, ".emubox")
var CARTRIDGES_PATH = filepath.Join(EMUBOX_PATH, ".local", "share", "cartridges")
var ASSET_URL = "https://emubox-cli.github.io/apps/"
var RELEASES_URL = "https://api.github.com/repos/%s/releases"
var CONTAINER_PREFIX = [4]string{
	"distrobox", 
	"enter", 
	"emubox", 
	"--",
}
var SUPPORTED_CONSOLES = [13]string{
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
    "ps3",
}

