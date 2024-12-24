import install from "../funcs/install";
import { InstallationTypes } from "../utils/config";

const HELP_MSG = `
emubox install: emubox install <...EMULATOR_IDS>
    Install emulators/utilites from "emubox list" in your container.

    Apps, as well as their binaries will be exported to the host.
`;
export default async function(...toInstall: string[]) {
    if (!toInstall.length) {
        console.log(HELP_MSG);
        return;
    }
    const method: InstallationTypes = "aur";
    /*const flatpak = toInstall.indexOf("--flatpak");
    if (flatpak !== -1) {
        method = "flatpak";
        
        toInstall.splice(
            flatpak,
            1
        );
    }

    const raCore = (toInstall.indexOf("--core") ?? toInstall.indexOf("-c"));
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