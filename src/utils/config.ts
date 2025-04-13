import { file, write } from "bun";
import { homedir } from "os";
import { join } from "path";

export function dir(...path: string[]) {
    return join(homedir(), ".emubox", ...path);
}

export type InstallationTypes = "aur" | "flatpak" | "github";

export interface Config {
    saveDir: string;
    romDir: string;
    coreDir: string;
    installed: {
        short: string;
        source: InstallationTypes;
        file?: string
    }[];
}

export async function openConfig(): Promise<Config> {
   let config = await file(dir("config.json")).json();
   config = Object.assign({
        saveDir: dir("saves"),
        romDir: dir("roms"),
        installed: [],
    }, config);

   return config;
}

export function writeConfig(content: Config) {
    write(dir("config.json"), JSON.stringify(content));
}

export async function configExists() {
    return file(dir("config.json")).exists();
}