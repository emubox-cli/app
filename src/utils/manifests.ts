import { exists } from "fs/promises";
import { getAppFromId, SupportedConsoles } from "./apps";
import { dir, openConfig } from "./config";
import { join } from "path";
import { readdir } from "fs/promises";
import { homedir } from "os";
import { write } from "bun";

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

            if (targetApp.installOptions.multi) {
                const config = await openConfig();
                const leApp = config.installed.find(m => m.id == targetApp.id)!;
                const userChoice = targetApp.installOptions.multi[leApp.mIndex!];
                targetApp.name = userChoice.multiName!;
            }

            console.log(`manifest-generator: Saved ${roms.length} entries to ${dirId}.json`);

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
    const parserData = parsers.find(d => d.id === dirId);
    if (!parserData) 
        throw new Error(`No parser found for '${dirId}'`);
    
    const targetRomDir = join(config.romDir, dirId);
    if (!await exists(targetRomDir)) {
        console.error("No rom directory found at " + targetRomDir);
        return;
    }

    const roms = await readdir(targetRomDir);
    for (const i of roms) {
        const title = i.split(".").shift()!;
        
        const parserRe = new RegExp(parserData.query);
        if (!parserRe.test(i)) 
            continue;

        coolData.push({
            title,
            target: join(homedir(), ".local", "bin", "emubox"),
            startIn: join(homedir(), ".local", "bin"),
            launchOptions: "run " + parserData.launchOptions.replace("{}", `"${join(targetRomDir, i)}"`),
            appendArgsToExecutable: false
        });
    }

    console.log(`manifest-generator: Saved ${roms.length} entries to ${dirId}.json`);

    write(
        join(MANIFEST_DIR, dirId, dirId + ".json"),
        JSON.stringify(coolData)
    );
}