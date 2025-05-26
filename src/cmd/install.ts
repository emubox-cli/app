import parseFlags from "utils/parseFlags";
import install from "../funcs/install";
import { InstallationTypes } from "../utils/config";

const HELP_MSG = `
emubox install: emubox install [--flags] <...EMULATOR_IDS>
    Install emulators/utilites from "emubox list" in your container.

    The installed apps will be exported to your app menu/desktop files.

    Options:
        -a|--appimage       Install the appimage variant of targeted apps
        -f|--flatpak        Install the flatpak variant
`;
export default async function(...toInstall: string[]) {
    let method: InstallationTypes = "aur";
    const {
        flags: { appimage: useAppimage, flatpak: useFlatpak },
        args
    } = parseFlags(toInstall, {
        appimage: ["-a", "--appimage"],
        flatpak: ["-f", "--flatpak"]
    });

    toInstall = args;

    if (useAppimage) {
        method = "github";
    }

    if (useFlatpak) {
        method = "flatpak";
    }

    if (!toInstall.length) {
        console.log(HELP_MSG);
        return;
    }

    for (const i of toInstall) {
        await install(i, method);
    }
}