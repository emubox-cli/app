import { $ } from "bun";
import { configExists, DEFAULT_ROM_DIR, dir, openConfig, writeConfig } from "utils/config";
import input from "@inquirer/input";
import select from "@inquirer/select";
import { /* getAppFromId, */ SUPPORTED_CONSOLES } from "utils/apps";
import { exists } from "fs/promises";
import install from "funcs/install";
// import containerPrefix from "utils/containerPrefix";

export default async function(...dumbArgs: string[]) {
    if (await configExists()) {
        if (!dumbArgs.includes("--restore")) {
            console.log("Already initialized");
            return;
        }

        const confirmRestoration = await select({
            message: "Config from previous installation was found, would you like to reinstall the apps from it?",
            choices: [
                "Yes",
                "No",
                // "Select Apps"
            ],
            default: "Yes"
        });

        await $`
            rm -rf $HOME/.emubox/apps
            mkdir -p $HOME/.emubox/apps
        `;
        
        const config = await openConfig();
        const previouslyInstalled = Object.freeze(config.installed);
        config.installed = [];
        writeConfig(config);
        if (confirmRestoration === "No") 
            return;
        
        if (config.romDir !== DEFAULT_ROM_DIR)
            await $`ln -s ${config.romDir} ${DEFAULT_ROM_DIR}`;

        /*if (confirmRestoration === "Select Apps") {
            const appsForReinstall = previouslyInstalled.map(d => {
                const app = getAppFromId(d.id);
                return `TRUE "${app?.name} (${d.source})"`;
            }).join("\n");
            await $`
                echo "${appsForReinstall}" >> emubox-reinstall
                cat emubox-reinstall | ${containerPrefix}zenity \
                   --list \
                   --title "Select Apps" \
                   --checklist \
                   --column="" --column="Apps"
                rm emubox-reinstall
            `.cwd("/tmp");
        }*/

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
        default: DEFAULT_ROM_DIR,
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
    if (romDir !== DEFAULT_ROM_DIR)
        await $`ln -s ${romDir} ${DEFAULT_ROM_DIR}`;
}