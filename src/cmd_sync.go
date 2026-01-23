package main

import (
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"github.com/sunshineplan/imgconv"
)

func cmdSync(args ...string) {
	config := getConfig()
	apps := getApps()
	handledLaunchers := []string{}
	var configEntry ConfigInstallData

	for i := range len(SUPPORTED_CONSOLES) {
		dir := SUPPORTED_CONSOLES[i]
		romDir := filepath.Join(EMUBOX_PATH, "roms", dir)

		if !pathExists(romDir) {
			fmt.Printf("Failed to find %s", romDir)
			fmt.Println()
			continue
		}
		fmt.Printf("Parsing %s roms...", dir)
		fmt.Println()

		roms, _ := os.ReadDir(romDir)
		potentialRunners := []AppData{}
		var finalRunner AppData

		for ii := range len(apps.Applications) {
			if slices.Contains(apps.Applications[ii].Consoles, dir) {
				potentialRunners = append(potentialRunners, apps.Applications[ii])
			}
		}

		for ii := range len(config.Installed) {
			installedEntry := config.Installed[ii]
			for iii := range len(potentialRunners) {
				runner := potentialRunners[iii]

				if runner.Id == installedEntry.Id {
					finalRunner = runner
					configEntry = installedEntry
					break
				}
			}

			if finalRunner.Id != "" {
				break
			}
		}

		if finalRunner.Id == "" {
			fmt.Printf("No runners availible for %s", dir)
			fmt.Println()
			continue
		}

		for ii := range len(roms) {
			romName := roms[ii].Name()
			matched, err := regexp.Match(potentialRunners[0].RegexQuery, []byte(romName))
			if err != nil {
				fmt.Println("uhh")
				continue
			}
			if !matched {
				continue	
			}

			displayName := romName
			romHash := hashString(romName)
			romLauncher := fmt.Sprintf("%s_%s", dir, romHash)
			handledLaunchers = append(handledLaunchers, romLauncher + ".json")
			fmt.Println(romName, finalRunner.Id)

			if (config.SgdbToken != "") {
				coversPath := filepath.Join(CARTRIDGES_PATH, "covers")
				coversDir, _ := os.ReadDir(coversPath)
				coverNames := []string{}
				for ii := range len(coversDir) {
					coverNames = append(coverNames, coversDir[ii].Name())
				}
				if !slices.Contains(coverNames, romLauncher + ".tiff") {
					results := fetchJson[SGDBSearchResults](
					    fmt.Sprintf("https://www.steamgriddb.com/api/v2/search/autocomplete/%s", url.QueryEscape(displayName)), 
					    config.SgdbToken,
				    )
					if results.Success && len(results.Data) != 0 {
						displayName = results.Data[0].Name
						fmt.Println("New name detected! ", displayName)
						grids := fetchJson[SGDBGrids](
							fmt.Sprintf("https://www.steamgriddb.com/api/v2/grids/game/%s?dimensions=600x900", fmt.Sprint(results.Data[0].ID)),
							config.SgdbToken,
						)
						if grids.Success && len(grids.Data) != 0 {
							
							urlSplit := strings.Split(grids.Data[0].URL, ".")
							imgSuffix := "." + urlSplit[len(urlSplit) - 1]
							imgPath := filepath.Join(coversPath, romLauncher + imgSuffix)
							downloadFile(
								grids.Data[0].URL, 
								imgPath,
						    )
							src, err := imgconv.Open(imgPath)
							if err != nil {
								fmt.Println(err.Error())
							}

							err = imgconv.Write(io.Discard, src, &imgconv.FormatOption{Format: imgconv.TIFF})
							err = imgconv.Save(strings.Replace(imgPath, imgSuffix, ".tiff", 1), src, &imgconv.FormatOption{Format: imgconv.TIFF})
							if err != nil {
								fmt.Println(err.Error())
							}

							os.Remove(imgPath)
						}
					}
				} else {
					fmt.Println("Cover already retrieved")
				}
			}

			if pathExists(filepath.Join(CARTRIDGES_PATH, "games", romLauncher + ".json")) {
				continue
			}
			
			gameRun := strings.ReplaceAll(finalRunner.Exec, "{}", "\"" + filepath.Join(romDir, romName) + "\"")
			exec := fmt.Sprintf("%s %s", filepath.Join(EMUBOX_PATH, "apps", configEntry.Exec), gameRun)

			saveCatridgesGame(romLauncher, displayName, exec)
		}
	}

	gamesPath := filepath.Join(CARTRIDGES_PATH, "games")
	gamesDir, _ := os.ReadDir(gamesPath)
	for i := range len(gamesDir) {
		data := gamesDir[i]
		isRom := false

		for ii := range len(SUPPORTED_CONSOLES) {
			if strings.HasPrefix(data.Name(), SUPPORTED_CONSOLES[ii]) {
				isRom = true
				break
			}
		}

		if !isRom {
			continue
		}

		if !slices.Contains(handledLaunchers, data.Name()) {
			fmt.Println("Detected unhandled rom", data.Name())

			os.Remove(filepath.Join(gamesPath, data.Name()))
		}

	}
}