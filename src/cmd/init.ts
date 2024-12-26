import { $ } from "bun";
import { dir, writeConfig } from "utils/config";
import input from "@inquirer/input";

import { SUPPORTED_CONSOLES } from "utils/apps";
import { exists } from "fs/promises";

export default async function() {
    const saveDir = await input({
        message: "Please provide a save directory.",
        default: dir("saves"),
    });
    
    const romDir = await input({
        message: "Please provide a rom directory.",
        default: dir("roms"),
    });
    
    const coreDir = await input({
        message: "Please provide a (retroarch) core directory.",
        default: dir("cores")
    });

    const config = {
        saveDir,
        romDir,
        coreDir,
        installed: []
    };
    
    writeConfig(config);

    if (!await exists(romDir)) {
        await $`mkdir ${romDir}`;
        for (const i of SUPPORTED_CONSOLES) {
            await $`mkdir ${romDir}/${i}`;
        }
    }
    
    await $`
        mkdir ${saveDir}
        mkdir ${coreDir}
    `.quiet().nothrow();
}