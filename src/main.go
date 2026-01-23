package main

import (
	"fmt"
	"os"
	"os/exec"
	"slices"
	"strings"
)

var EMUBOX_VERSION string

func main() {
	// fmt.Println("sex")
	fmt.Println(EMUBOX_VERSION)
	checkDistrobox()
	checkPaths()

	if (len(os.Args[1:]) < 1) {
		fmt.Println("Exitting...")
		os.Exit(1)
	}
	cmd := os.Args[1]
	extra := os.Args[2:]

	commands := map[string]func(args ...string) {
		"init": cmdInit,
		"install": cmdInstall,
		"run": cmdRun,
		"sync": cmdSync,
		"remove": cmdRemove,
		"run-cartridges": cmdCartridges,
		"test": cmdTest,
	}

	if cmd == "" || commands[cmd] == nil {
		fmt.Println("No command? :(")
		os.Exit(1)
	}

	commands[cmd](extra...)

	// fmt.Println("FETCH",fetchJson("https://emubox-cli.github.io/apps/yuzu.json"))
	// fmt.Println("FILE", getConfig())
}

func precheck() {}


func cmdTest(args ...string) {
	config := getConfig()
	apps := getApps().Applications
	fullIds := []string{}
	for i := range apps {
		fullIds = append(fullIds, apps[i].Id)
	}
	zenityArgs := []string{}
	zenityArgs = append(zenityArgs, "zenity", "--list", "--checklist", "--text=Checked emulators will be installed and vice versa.", "--column=Installed", "--column=Emulator")
	excluded := []string{}
	for i := range apps {
		if slices.Contains(apps[i].InstallOptions, "m") {
			excluded = append(excluded, apps[i].Id)
			continue
		}
		isInstalled := false
		stringOfTruth := ""
		for ii := range config.Installed {
			if config.Installed[ii].Id == apps[i].Id {
				isInstalled = true
				break
			}
		}

		
		if isInstalled {
			stringOfTruth = "TRUE"
		} else {
			stringOfTruth = "FALSE"
		}
		zenityArgs = append(zenityArgs, stringOfTruth)
		zenityArgs = append(zenityArgs, apps[i].Id)
	}

	cmdArgs := append(CONTAINER_PREFIX[1:], zenityArgs...)

	cmd := exec.Command("distrobox", cmdArgs...)

	stdout, err := cmd.Output()
	if err != nil {
		fmt.Println("User cancelled")
		return
	}
	
	selected := strings.Split(strings.ReplaceAll(string(stdout), "\n", ""), "|")
	toInstall := []string{}
	toRemove := []string{}
	
	for i := range fullIds {
		isInstalled := false
		for ii := range config.Installed {
			if config.Installed[ii].Id == fullIds[i] {
				isInstalled = true
				break
			}
		}

		if slices.Contains(selected, fullIds[i]) {
			if !isInstalled {
				toInstall = append(toInstall, fullIds[i])
			}
		} else {
			if !isInstalled {
				continue
			}
			if slices.Contains(excluded, fullIds[i]) {
				continue
			}
			toRemove = append(toRemove, fullIds[i])
		}
	}
	cmdInstall(toInstall...)
	cmdRemove(toRemove...)
}