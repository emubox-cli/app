import { $ } from "bun";
import { hostname } from "os";
import { version } from "../package.json";
import install from "cmd/install";
import ls from "cmd/ls";
import remove from "cmd/remove";
import uninstall from "cmd/uninstall";
import update from "cmd/update";

const HELP_MSG = 
`
emubox: emubox [--help|-h] [COMMAND]
    Manage emulators applications via emubox.

    Options:
        -h, --help                show this help text and exit
        -v, --version             show emubox version and exit


    Commands:
        list, ls                  list all availible emulators in emubox 
        uninstall                 remove emubox and the distrobox container
        install, i <...EMU_IDS>   install provided emulators
        remove, rm <...EMU_IDS>   remove provided emulators
        update                    update emubox container
`;

const [ , , cmd, ...rest ] = process.argv;

if (!cmd || process.argv.length === 2) {
    console.log(HELP_MSG);
    process.exit();
}


switch (cmd) {
    case "i":
    case "install":
        await doContainerCheck();
        install(...rest);
        break;
    case "ls":
    case "list":
        ls();
        break;
    case "rm":
    case "remove":
        await doContainerCheck();
        remove(...rest);
        break;
    case "uninstall":
        await doContainerCheck();
        uninstall();
        break;
    case "update":
        await doContainerCheck();
        update();
        break;
    case "-v":
    case "--version":
        console.log(version);
        break;
    case "-h":
    case "--help":
    default: 
        console.log(HELP_MSG);
}

async function doContainerCheck() {
    if (!hostname().startsWith("emubox.")) {
        const boxList = await $`distrobox ls`.quiet().text();
        if (!boxList.includes("emubox")) {
            console.error("Emubox container wasn't found, please run the installer again.")
            process.exit();
        }
    }
}