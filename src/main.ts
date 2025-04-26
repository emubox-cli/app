import { $ } from "bun";
import { hostname } from "os";
import install from "cmd/install";
import ls from "cmd/ls";
import remove from "cmd/remove";
import uninstall from "cmd/uninstall";
import update from "cmd/update";
import init from "cmd/init";
import run from "cmd/run";
import genManifest from "cmd/gen-manifest";
import { configExists } from "utils/config";
import { yellow } from "yoctocolors";
import { version } from "../package.json";
import displayVersion from "utils/displayVersion";
import makeLauncher from "cmd/make-launcher";

const HELP_MSG = 
`
emubox (${version}-${displayVersion}): emubox [--help|-h] [COMMAND]
    Manage emulator applications via emubox.

    Options:
        -h, --help                show this help text and exit
        -v, --version             show emubox version and exit


    Commands:
        init                      initialize emubox directories and config 
        list, ls                  list all availible emulators in emubox
        gen-manifest <EMU_ID>     create manual manifest file for steam rom manager
        uninstall                 remove emubox and the distrobox container
        install, i <...EMU_IDS>   install provided emulators
        remove, rm <...EMU_IDS>   remove provided emulators
        update                    update container apps
        run                       launch an installed emulator
`;

const [ , , cmd, ...rest ] = process.argv;

if (!cmd || process.argv.length === 2) {
    console.log(HELP_MSG);
    process.exit();
}

const debug = rest.indexOf("--debug");
export const debugMode = debug !== -1;
if (debugMode)
    rest.splice(debug, 1);

switch (cmd) {
    case "init":
        init(...rest);
        break;
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
    case "run":
        await doContainerCheck();
        run(...rest);
        break;
    case "gen-manifest":
        await doContainerCheck();
        genManifest(rest[0]);
        break;
    case "make-launcher":
        await doContainerCheck();
        makeLauncher(rest[0], rest[1]);
        break;
    case "-v":
    case "--version":
        console.log(`${version}-${displayVersion}`);
        break;
    case "-h":
    case "--help":
    default: 
        console.log(HELP_MSG);
}

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