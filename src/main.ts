/* eslint-disable @typescript-eslint/no-explicit-any */
import { $ } from "bun";
import { hostname } from "os";
import { configExists } from "utils/config";
import { yellow } from "yoctocolors";
import * as cmd from "cmd";

const [ , , userCmd, ...rest ] = process.argv;
const commandInQuestion = (cmd as any)[userCmd];

if (!userCmd || process.argv.length === 2 || !commandInQuestion) {
    (cmd as any)["-h"]();
    process.exit();
}


if (!cmd.SKIP_CONTAINER_CHECK.includes(userCmd)) 
    await doContainerCheck();

commandInQuestion(...rest);


async function doContainerCheck() {
    if (!await configExists()) {
        console.log(yellow("Please run 'emubox init' first."));
        process.exit(1);
    }

    if (!hostname().startsWith("emubox.")) {
        const boxList = await $`distrobox ls`.quiet().text();
        if (!boxList.includes("emubox")) {
            console.error("Emubox container wasn't found, please run the installer again.");
            process.exit(1);
        }
    }
}

process.on("uncaughtException", (e) => {
    console.error("Emubox ran into an error mid process: " + e.message);
    console.error(e.stack);
});