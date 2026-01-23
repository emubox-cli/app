package main

import (
	"fmt"
	"os/exec"
)

func cmdCartridges(args ...string) {
	cmdSync()

	cmdArgs := append(CONTAINER_PREFIX[1:], "cartridges")

	cmd := exec.Command(
		CONTAINER_PREFIX[0],
		cmdArgs...,
		
	)
	_, err := cmd.Output() 
	if err != nil {
		fmt.Println(err.Error())
	}
}