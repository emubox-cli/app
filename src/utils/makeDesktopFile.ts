import { $, write } from "bun";
import { homedir } from "os";
import { join } from "path";

export default async (filename: string, {
    name,
    exec,
    icon
}: { [x: string]: string }) => {
    const writeDir = join(homedir(), ".local", "share", "applications", filename + ".desktop");
    write(writeDir,
        `\
[Desktop Entry]
Type=Application
Name=${name}
Exec=${join(homedir(), ".local", "bin", "emubox") + " run " + exec}
Icon=${icon}
Categories=Game;Emulator;
`);
    await $`ln -s "${writeDir}" "${homedir()}/Desktop/${filename}.desktop"`;

};
    