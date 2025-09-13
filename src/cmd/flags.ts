import displayVersion from "utils/displayVersion";
import pkg from "../../package.json";


export function version() {
    console.log(`${pkg.version}-${displayVersion}`);
}

const HELP_MSG = 
    `\
emubox (${pkg.version}-${displayVersion}): emubox [--flags] [COMMAND]
    Manage emulator applications via emubox.

    Options:
        -h, --help                show this help text and exit
        -v, --version             show emubox version and exit

    Commands:
        init                      initialize emubox directories and config 
        list, ls                  list all availible emulators in emubox
        uninstall                 remove emubox and the distrobox container
        install, i <...EMU_IDS>   install provided emulators
        remove, rm <...EMU_IDS>   remove provided emulators
        update                    update container apps
        run                       launch an installed emulator
`;

export function help() {
    console.log(HELP_MSG);
}