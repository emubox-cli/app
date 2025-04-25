import confirm from "@inquirer/confirm";
import { DEFAULT_ROM_DIR, openConfig } from "../utils/config";
import { yellow, bold } from "yoctocolors";
import { $ } from "bun";
import remove from "funcs/remove";
import { debugMode } from "../main";

const CONFIRMATION_MSG = [
    "Are you sure you want to uninstall emubox?",
    yellow("This will delete the emubox container and all apps installed within it."),
    yellow("Respective app configurations will not be deleted.")
].join("\n");

export default async function() {
    const config = await openConfig();
    
    const confirmation = debugMode ? true : await confirm({
        message: CONFIRMATION_MSG,
        default: false
    });

    if (!confirmation) {
        console.log("Rejected, exitting");
        return;
    }

    const deleteConfig = await confirm({
        message: "Would you like to delete your emubox config?",
        default: false
    });

    if (deleteConfig) 
        await $`rm $HOME/.emubox/config.json`;
    else for (const i of config.installed)
        remove(i.id);

    if (config.romDir !== DEFAULT_ROM_DIR)
        await $`unlink ${DEFAULT_ROM_DIR}`;

    await $`distrobox rm emubox -Y`.nothrow();
    if (!debugMode)
        await $`
            rm $HOME/.local/bin/emubox
            rm $HOME/.local/bin/emubox-update
        `;

    console.log(bold("Emubox has been removed from your system."));
}