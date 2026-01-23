package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	s "strings"
	r "regexp"
)

func checkDistrobox() {
	cmd := exec.Command(
		"which",
		"distrobox",
	)
	_, err := cmd.Output()
	if err != nil {
		fmt.Println("Distrobox not found on system. Exitting...", err.Error())
		os.Exit(1)
	}

	cmd2 := exec.Command(
		"distrobox",
		"ls",
	)

	stdout, err2 := cmd2.Output()
	if err2 != nil {
		return
	}

	emuboxCheck, _ := r.Match(
		`.*\| emubox +\| .* \| ghcr\.io\/emubox-cli\/emubox:latest`,
		[]byte(stdout),
	)

	// TODO: more precise check
	if !emuboxCheck {
		var userInput string

		fmt.Println("Emubox wasn't found in your distrobox list.")
		fmt.Print("Would you like to create it now? [Y/n] ")
		fmt.Scanln(&userInput)

		if (s.ToLower(userInput) != "y") {
			os.Exit(0)
		}

		createCmd := exec.Command(
			"distrobox",
			"create",
			"emubox",
			"-i",
			"ghcr.io/emubox-cli/emubox:latest",
			"-H",
			EMUBOX_PATH,
			"--no-entry",
			"-Y",
		)
		_, err := createCmd.Output()
		if err != nil {
			fmt.Println("Failed to create emubox container")
			os.Exit(1)
		}

		fmt.Println("Emubox container created successfully.")
		fmt.Println("Creating cartridges desktop file...")
		desktopFile := fmt.Sprintf(`\
[Desktop Entry]
Type=Application
Name=Cartridges (Emubox)
Exec=%s/.local/bin/emubox run-cartridges
Icon=page.kramo.Cartridges
Categories=Game;Emulator;
`, HOME_DIR)

	os.WriteFile(filepath.Join(HOME_DIR, ".local", "share", "applications", "emubox-cartridges.desktop"), []byte(desktopFile), os.ModePerm)	

	}

}

func checkPaths() {
	if pathExists(EMUBOX_PATH) {
		return
	}

	fmt.Println("Making .emubox direcory...")
	var FOLDERS_TO_MAKE = []string{
		".local/share/cartridges/games",
		".local/share/cartridges/covers",
		".config",
		"apps",
		"bios",
		"mods",
	}

	for i := 0; i < len(FOLDERS_TO_MAKE); i++ {
		os.MkdirAll(filepath.Join(EMUBOX_PATH, FOLDERS_TO_MAKE[i]), os.ModePerm)
	}
}