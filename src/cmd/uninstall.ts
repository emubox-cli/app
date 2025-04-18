import confirm from "@inquirer/confirm";
import { openConfig, writeConfig } from "../utils/config";
import chalk from "chalk";
import { $ } from "bun";
import remove from "funcs/remove";
import { debugMode } from "../main";

const CONFIRMATION_MSG = [
    "Are you sure you want to uninstall emubox?",
    chalk.yellow("This will delete the emubox container and all apps installed within it."),
    chalk.yellow("Respective app configurations will not be deleted.")
].join("\n");

export default async function() {
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
    else {
        const config = await openConfig();
        for (const i of config.installed)
            if (i.source === "github") 
                remove(i.id);
        
        config.installed = [];

        writeConfig(config);
    }

    await $`distrobox rm emubox -Y`.nothrow();
    if (!debugMode)
        await $`
            rm $HOME/.local/bin/emubox
            rm $HOME/.local/bin/emubox-update
        `;

    console.log(chalk.bold("Emubox has been removed from your system."));
}