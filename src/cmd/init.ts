import { $ } from "bun";
import { configExists, dir, openConfig, writeConfig } from "utils/config";
import input from "@inquirer/input";
import confirm from "@inquirer/confirm";
import { SUPPORTED_CONSOLES } from "utils/apps";
import { exists } from "fs/promises";
import install from "funcs/install";

export default async function(...dumbArgs: string[]) {
    if (await configExists()) {
        if (!dumbArgs.includes("--restore")) {
            console.log("Already initialized");
            return;
        }

        const confirmRestoration = await confirm({
            message: "Config from previous installation was found, would you like to reinstall the apps from it?" +
                "()",
            default: true
        });

        await $`
            rm -rf $HOME/.emubox/apps
            mkdir -p $HOME/.emubox/apps
        `;
        
        const config = await openConfig();
        const previouslyInstalled = Object.freeze(config.installed);
        config.installed = [];
        writeConfig(config);

        if (!confirmRestoration) 
            return;

        for (const i of previouslyInstalled)
            await install(i.id, i.source);
        
        return;
    }

    const saveDir = await input({
        message: "Please provide a save directory.",
        default: dir("saves"),
    });
    
    const romDir = await input({
        message: "Please provide a rom directory.",
        default: dir("roms"),
    });
    

    const config = {
        saveDir,
        romDir,
        installed: []
    };
    
    writeConfig(config);

    if (!await exists(romDir)) {
        await $`mkdir ${romDir}`;
        for (const i of SUPPORTED_CONSOLES) {
            await $`mkdir ${romDir}/${i}`;
        }
    }
    
    await $`mkdir -p ${saveDir}`.quiet().nothrow();
}