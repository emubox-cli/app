package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func cmdInstall(args ...string) {
	config := getConfig()
	apps := getApps()
	for i := range len(args) {
		isInstalled := false
		
	    for ii := range len(config.Installed) {
		    isInstalled = config.Installed[ii].Id == args[i]
			if isInstalled {
				break
			}
    	}

		if isInstalled {
			fmt.Printf("'%s' already installed", args[i])
			fmt.Println()
			continue
		}

		var appData AppData
		for ii := range len(apps.Applications) {
			if apps.Applications[ii].Id == args[i] {
				appData = apps.Applications[ii]
				break
			}
		}

		if appData.Id == "" {
			fmt.Printf("'%s' not found", args[i])
			fmt.Println()
			continue
		}

		fetched := fetchAppData(args[i])
		if args[i] == "ryujinx" {
			fmt.Println("todo: gitlab release implementation")
			ryujinxReleases := fetchJson[GitlabReleases]("https://git.ryujinx.app/api/v4/projects/1/releases", "")
			// fmt.Println(ryujinxReleases[0].Assets)
			targetAsset := -1
			for iii := range len(ryujinxReleases[0].Assets.Links) {
				asset := ryujinxReleases[0].Assets.Links[iii]
				if strings.HasSuffix(asset.Name, "x64.AppImage") {
					targetAsset = iii
					break
				}
			}

			if targetAsset != -1 {
				appPath := filepath.Join(EMUBOX_PATH, "apps", ryujinxReleases[0].Assets.Links[targetAsset].Name)
				downloadFile(
					ryujinxReleases[0].Assets.Links[targetAsset].DirectAssetURL,
					appPath,
				)
				os.Chmod(appPath, 0777)

				downloadFile(
					ASSET_URL + "grids/" + args[i] + ".tiff",
					filepath.Join(CARTRIDGES_PATH, "covers", "emu_" + args[i] + ".tiff"),
				)

				installSect := ConfigInstallData{
					Id: args[i],
					Exec: ryujinxReleases[0].Assets.Links[targetAsset].Name,
					ReleaseId: fmt.Sprint(ryujinxReleases[0].Commit.ID),
				}

				config.Installed = append(config.Installed, installSect)

				saveCatridgesGame("emu_" + args[i], appData.Name, appPath)
				saveConfig(config)
			}
			continue
		}
		releases := fetchJson[[]GithubReleases](fmt.Sprintf(RELEASES_URL, fetched.InstallOptions.GitRepo), "")

		for ii := range len(releases) {
			targetAsset := -1
			for iii := range len(releases[ii].Assets) {
				asset := releases[ii].Assets[iii]
				matched, err := regexp.Match(fetched.InstallOptions.GitRe, []byte(asset.Name))
				if err != nil {
					fmt.Println("Regex failed")
					continue
				}

				if matched {
					fmt.Println("FOUND ASSET")
					targetAsset = iii
					break
				}

				

				
				// if releases[ii].Assets[iii].Name {}
			}

			if targetAsset != -1 {
				daAsset := releases[ii].Assets[targetAsset]
				appPath := filepath.Join(EMUBOX_PATH, "apps", daAsset.Name)
				downloadFile(
					daAsset.BrowserDownloadURL, 
					appPath,
				)
				os.Chmod(appPath, 0777)

				downloadFile(
					ASSET_URL + "grids/" + args[i] + ".tiff",
					filepath.Join(CARTRIDGES_PATH, "covers", "emu_" + args[i] + ".tiff"),
				)

				installSect := ConfigInstallData{
					Id: args[i],
					Exec: daAsset.Name,
					ReleaseId: fmt.Sprint(releases[ii].ID),
				}

				config.Installed = append(config.Installed, installSect)


				for k := range fetched.PostInstall.MakeLinks {
					linkPath := addPathVariables(fetched.PostInstall.MakeLinks[k].(string), args[i])
					refPath := addPathVariables(k, args[i])

					if pathExists(refPath) {
						fmt.Println(linkPath, refPath)
						continue
					} else {
						os.MkdirAll(refPath, os.ModePerm)
					}

					if pathExists(linkPath) {
						os.Remove(linkPath)
					}

					os.Mkdir(linkPath, os.ModePerm)
					err := os.Symlink(refPath, linkPath) 
					if err != nil {
						fmt.Println(err.Error())
					}
				}
				
				for iii := range len(fetched.PostInstall.MakeDirs) {
					dirToMake := fetched.PostInstall.MakeDirs[iii]
					dirToMake = addPathVariables(dirToMake, args[i])

					os.MkdirAll(dirToMake, os.ModePerm)
				}

				for iii := range len(fetched.PostInstall.MakeFiles) {
					entry := fetched.PostInstall.MakeFiles[iii]
					entrySplit := strings.Split(entry.Path, ".")
					switch entrySplit[len(entrySplit) - 1] {
					    case "ini":
						case "cfg":
						case "conf":
						case "toml":
							ini := ""
					        for k := range entry.Content.(MapOfDoom) {
						    	data := entry.Content.(MapOfDoom)[k]
    
						    	ini += fmt.Sprintf("[%s]\n", k)
						    	for kk := range data.(MapOfDoom) {
						    		finalStr := data.(MapOfDoom)[kk].(string)
						    		finalStr = addPathVariables(finalStr, args[i])
						    		ini += kk + "=" + finalStr + "\n"
						    	}
					        }
    
						    os.WriteFile(entry.Path, []byte(ini), os.ModePerm)
						default:
							fmt.Println("install: config file type not implemented", entrySplit[len(entrySplit) - 1])

					}					
				}
				
				saveCatridgesGame("emu_" + args[i], appData.Name, appPath)
				saveConfig(config)

				break
			} else {
				fmt.Println("No asset found...")
			}
		}
	}
}