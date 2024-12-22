import { $ } from "bun";
import { input } from "@inquirer/prompts";
import { configExists, dir, writeConfig } from "./utils/config";
import chalk from "chalk";
import { userInfo } from "os";
import { exists } from "fs/promises";
import { SUPPORTED_CONSOLES } from "./utils/apps";

if (userInfo().uid === 0) {
    console.log(chalk.yellow("Please don't run this as root."));
    process.exit();
}

await $`
    mkdir $HOME/.emubox
    mkdir $HOME/.emubox/launchers
    # mkdir $HOME/.emubox/apps
`.nothrow().quiet();

let saveDir: string;
let romDir: string;
let coreDir: string;

if (!await configExists()) {
    saveDir = await input({
        message: "Please provide a save directory.",
        default: dir("saves"),
    });

    romDir = await input({
        message: "Please provide a rom directory.",
        default: dir("roms"),
    });

    coreDir = await input({
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
    `.nothrow().quiet();
}

await $`
    distrobox create \
        -Y \
        --no-entry \
        --name emubox \
        --unshare-netns \
        --image ghcr.io/ublue-os/arch-distrobox:latest \
        --nvidia

    distrobox enter emubox -- \
        sudo pacman -Syu --noconfirm archlinux-keyring noto-fonts noto-fonts-cjk
    distrobox enter emubox -- sudo locale-gen "$LANG" 

    # DEBUG FUNCTIONALITY: build binary and export it to user apps
    # bun build ./src/main.ts --compile --outfile ./emubox
    # cp ./emubox $HOME/.local/bin/emubox

    # download binary, copy to .local/bin
    # curl https://github.com/skullbite/emubox | bash 
`;

console.log(chalk.green.bold("Emubox container successfully created!"));
console.log("Run `emubox -h` to get started.");