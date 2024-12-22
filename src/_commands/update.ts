import { $, file } from "bun";
import { homedir } from "os";
import { join } from "path";
import { getAppFromShort } from "../utils/apps";

const config = await file(join(homedir(), ".emubox", "config.json")).json();
config.installed = config.installed ?? [];

const aurPkgs = config.installed.filter(d => d.source === "aur");
const aursToUpdate: string[] = [];
const flatpaks = config.installed.filter(d => d.source === "flatpak");

for (const { short } of aurPkgs) {
    const app = getAppFromShort(short);
    const res = await $`pacman -Qu ${app?.installOptions.aur}`.text();
    if (res !== "") 
        aursToUpdate.push(app!.installOptions!.aur!);
}

for (const { short } of flatpaks) {
    const app = getAppFromShort(short);
    await $`distrobox-exec-host flatpak update -u ${app?.installOptions.flatpak}`;
}

import("../main");