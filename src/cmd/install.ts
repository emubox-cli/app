import install from "../funcs/install";
import { InstallationTypes } from "../utils/config";

const HELP_MSG = `
emubox install: emubox install [--appimage] <...EMULATOR_IDS>
    Install emulators/utilites from "emubox list" in your container.

    Apps, as well as their binaries will be exported to the host.

    Options:
        --appimage        Install the appimage variant of targeted apps
`;
export default async function(...toInstall: string[]) {
    let method: InstallationTypes = "aur";
    const useAppimage = toInstall.indexOf("--appimage");
    const useFlatpak = toInstall.indexOf("--flatpak");

    if (useAppimage !== -1) {
        method = "github";
        toInstall.splice(useAppimage, 1);
    }

    if (useFlatpak !== -1) {
        method = "flatpak";
        toInstall.splice(useFlatpak, 1);
    }

    if (!toInstall.length) {
        console.log(HELP_MSG);
        return;
    }

    /*const raCore = (toInstall.indexOf("--core") ?? toInstall.indexOf("-c"));
    if (raCore != -1) {
        const config = await openConfig();
        if (!config.installed.find(d => d.short === "retroarch")) {
            console.error("Install retroarch before installing cores (emubox install retroarch)");
            return;
        }

        toInstall.splice(
            raCore,
            1
        );
    }*/
    for (const i of toInstall) {
        install(i, method);
    }
}