import { exists } from "fs/promises";
import { getAppFromId, SupportedConsoles } from "./apps";
import { dir, openConfig } from "./config";
import { join } from "path";
import { readdir } from "fs/promises";
import { homedir } from "os";
import { file, write } from "bun";

const MANIFEST_DIR = dir("manifests");
const parsers = (await import("./parsers.json")).default;

export async function generateManifest(dirId: SupportedConsoles | "emulators") {
    const config = await openConfig();
    const coolData = [];

    if (dirId === "emulators") {
        for (const i of config.installed) {
            const targetApp = getAppFromId(i.id)!;
            if (targetApp?.makeLauncher === false)
                continue;

            console.log(`+ ${targetApp.name}`);

            coolData.push({
                title: targetApp.name,
                target: join(homedir(), ".local", "bin", "emubox"),
                startIn: join(homedir(), ".local", "bin"),
                launchOptions: `run ${targetApp.id}`,
                appendArgsToExecutable: false
            });
        }

        write(
            join(MANIFEST_DIR, dirId, dirId + ".json"),
            JSON.stringify(coolData)
        );

        return;
    }
    const parserData = parsers.find(d => d.id === dirId)!;
    
    const targetRomDir = join(config.romDir, dirId);
    if (!await exists(targetRomDir)) {
        console.error("No rom directory found at " + targetRomDir);
        return;
    }

    for (const i of await readdir(targetRomDir)) {
        const title = i.split(".").shift()!;
        const parserRe = new RegExp(parserData.query.replace("{}", title.replaceAll("(", "\\(").replaceAll(")", "\\)")!))
        if (!parserRe.test(i)) 
            continue;

        console.log(`+ ${i}`);

        coolData.push({
            title,
            target: join(homedir(), ".local", "bin", "emubox"),
            startIn: join(homedir(), ".local", "bin"),
            launchOptions: parserData.launchOptions.replace("{}", `"${join(targetRomDir, i)}"`),
            appendArgsToExecutable: false
        });
    }

    write(
        join(MANIFEST_DIR, dirId, dirId + ".json"),
        JSON.stringify(coolData)
    );
}