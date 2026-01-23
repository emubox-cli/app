package main

import (
	"fmt"
	"os"
	"path/filepath"
)

var DEFAULT_ROM_DIR = filepath.Join(EMUBOX_PATH, "roms")
var DEFAULT_SAVE_DIR = filepath.Join(EMUBOX_PATH, "saves")

func cmdInit(args ...string) {
	var romDir, saveDir, sgdbToken string
	config_obj := Config{
		Installed: []ConfigInstallData{},
		RomDir:    "",
		SaveDir:   "",
		SgdbToken: "",
	}

	if pathExists(filepath.Join(EMUBOX_PATH, "config.json")) {
		fmt.Println("Already initialized")
		return
	}

	fmt.Print("Please provide a rom directory. ")
	fmt.Scan(&romDir)

	if romDir == "" {
		romDir = DEFAULT_ROM_DIR
	}
	updateRomDir(romDir)
	config_obj.RomDir = romDir

	fmt.Print("Please provide a save directory. ")
	fmt.Scan(&saveDir)

	if saveDir == "" {
		saveDir = DEFAULT_SAVE_DIR
	}
	os.Mkdir(saveDir, os.ModePerm)
	config_obj.SaveDir = saveDir

	fmt.Print("Optionally, provide a SteamGridDB token for getting game grids. ")
	fmt.Scan(&sgdbToken)

	config_obj.SaveDir = sgdbToken
	
	saveConfig(config_obj)
}

func _createRomDir(romDir string) {
	for i := range len(SUPPORTED_CONSOLES) {
		os.MkdirAll(filepath.Join(romDir, SUPPORTED_CONSOLES[i]), os.ModePerm)
	}

	if romDir != DEFAULT_ROM_DIR {
		os.Symlink(romDir, DEFAULT_ROM_DIR)
	}

}

func updateRomDir(romDir string) {
	if romDir != DEFAULT_ROM_DIR {
		if pathExists(DEFAULT_ROM_DIR) {
			if isLink(DEFAULT_ROM_DIR) {
				os.Remove(DEFAULT_ROM_DIR)
			} else {
				dex := 0
				for pathExists(filepath.Join(EMUBOX_PATH, "roms.bak"+string(rune(dex)))) {
					dex += 1
				}

				os.Rename(DEFAULT_ROM_DIR, DEFAULT_ROM_DIR+".bak"+string(rune(dex)))
			}

		}
	}

	_createRomDir(romDir)
}
