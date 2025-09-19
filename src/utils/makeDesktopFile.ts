
import { $, write } from "bun";
import { homedir } from "os";
import { join } from "path";
import { openConfig } from "./config";

export default async (filename: string, {
    name,
    exec,
    icon,
    extraCategories = ""
}: { [x: string]: string }) => {
    const writeDir = join(homedir(), ".local", "share", "applications", filename + ".desktop");
    write(writeDir,
        `\
[Desktop Entry]
Type=Application
Name=${name}
Exec=${join(homedir(), ".local", "bin", "emubox") + " run " + exec}
Icon=${icon}
Categories=Game;Emulator;${extraCategories}
`);
    if ((await openConfig()).addDesktopShortcut)
        await $`ln -s "${writeDir}" "${homedir()}/Desktop/${filename}.desktop"`;

};
    