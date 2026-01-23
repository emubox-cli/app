package main

import (
	"os"
	"path/filepath"
)

func cmdRemove(args ...string) {
	config := getConfig()
	for i := range len(args) {
		var installData ConfigInstallData
		remainingData := config.Installed
		dlIndex := -1
		
	    for ii := range len(config.Installed) {
			if config.Installed[ii].Id == args[i] {
				dlIndex = ii
				break
			}
    	}

		
		if dlIndex != -1 {
			remainingData = append(remainingData[:dlIndex], remainingData[dlIndex+1:]... )
			os.Remove(filepath.Join(EMUBOX_PATH, "apps", installData.Exec))
			os.Remove(filepath.Join(CARTRIDGES_PATH, "games", "emu_" + args[i] + ".json"))
			config.Installed = remainingData

			saveConfig(config)
		}
	}
}