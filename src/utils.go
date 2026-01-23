package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func getConfig() Config {
	return getJsonFile[Config](filepath.Join(EMUBOX_PATH, "config.json"))
}

func saveConfig(data any) {
	saveJson(filepath.Join(EMUBOX_PATH, "config.json"), data)
}

func addPathVariables(target string, id string) string {
	target = strings.ReplaceAll(target, "<save>", getConfig().SaveDir)
	target = strings.ReplaceAll(target, "<share>", filepath.Join(EMUBOX_PATH, ".local", "share"))
	target = strings.ReplaceAll(target, "<config>", filepath.Join(EMUBOX_PATH, ".config"))
	target = strings.ReplaceAll(target, "<bios>", filepath.Join(EMUBOX_PATH, "bios"))
	target = strings.ReplaceAll(target, "<mods>", filepath.Join(EMUBOX_PATH, "mods"))
	target = strings.ReplaceAll(target, "<roms>", filepath.Join(EMUBOX_PATH, "roms"))
	target = strings.ReplaceAll(target, "<id>", id)

	return target
}

func saveCatridgesGame(id string, name string, exec string) {
	cartridgesFile := CartridgesGameFile{
		Added: int(time.Now().UTC().UnixMilli()),
		Blacklisted: false,
		Developer: "",
		Executable: exec,
		GameId: id,
		Hidden: false,
		LastPlayed: 0,
		Name: name,
		Source: "imported",
		Version: 1.5,
	}

	saveJson(filepath.Join(CARTRIDGES_PATH, "games", id + ".json"), cartridgesFile)
}

func getApps() AppDetails {
	appsPath := filepath.Join(EMUBOX_PATH, "apps.json")
	if !pathExists(appsPath) {
		downloadFile(ASSET_URL + "apps.json", appsPath)
	}

	return getJsonFile[AppDetails](appsPath)
}

func pathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func isLink(path string) bool {
	if !pathExists(path) {
		return false
	}

	info, err := os.Lstat(path)
	if err != nil {
		return false
	} else if info.Mode()&os.ModeSymlink != 0 {
		return true
	}
	return false
}

func hashString(target string) (string) {
	sha := md5.New()
	sha.Write([]byte(target))
	
	bs := sha.Sum(nil)

	return hex.EncodeToString(bs[:])
}

func matchHash(target string, hash string) (bool) {
	return hashString(target) == hash 
}

func fetch(url string, sgdbAuth string) []byte {
	client := &http.Client{}
	req, _ := http.NewRequest(
		"GET", 
		url,
	    nil,
	)
	
	if sgdbAuth != "" {
		req.Header.Set("Authorization", "Bearer " + sgdbAuth)
	}
	
	res, err := client.Do(req)
	if err != nil {
		fmt.Println("fetch: Request failed")
		return nil
	}

	defer res.Body.Close()

	data, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("fetch: Data unreadable")
		return nil
	}

	return data
}

func downloadFile(url string, path string) {
	if pathExists(path) {
		os.Remove(path)
	}
	out, err := os.Create(path)
	if err != nil {
		fmt.Println("fetch: Couldn't open path", path)
		return
	}

	res, err := http.Get(url)
	if err != nil {
		fmt.Println("fetch: Request failed")
		return
	}

	defer res.Body.Close()

	_, err = io.Copy(out, res.Body)
	if err != nil {
		fmt.Println("downloadFile: Failed to download")
	}

}
