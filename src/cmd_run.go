package main

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

func cmdRun(args ...string) {
	config := getConfig()
	isInstalled := false
	var data ConfigInstallData

	for i := range len(config.Installed) {
		isInstalled = config.Installed[i].Id == args[0]
		
		if isInstalled {
			data = config.Installed[i]
			break
		}
	}

	if !isInstalled {
		fmt.Println("NOT INSTALLED")
		return
	}

	cmdArgs := append(CONTAINER_PREFIX[1:], filepath.Join(EMUBOX_PATH, "apps", data.Exec))
	cmdArgs = append(cmdArgs, args[1:]...)
	// fmt.Println(cmdArgs)

	cmd := exec.Command(
		CONTAINER_PREFIX[0],
		cmdArgs...,
	)
	_, err := cmd.Output() 
	if err != nil {
		fmt.Println(err.Error())
	}

}