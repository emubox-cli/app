import { $, file} from "bun";
import { exists } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { dir } from "./config";

export default async function() {
    if (!await exists(join(homedir(), ".emubox", "apps.json"))) 
        await getAppFile();
    else {
        const latest = await $`curl https://emubox-cli.github.io/apps/apps.json | jq -M -c '.v'`.text();
        const appsFile = await file(dir("apps.json")).json();
        if (latest !== appsFile.v) {
            await $`rm $HOME/.emubox/apps.json`;
            await getAppFile();
        } 
    }
}

async function getAppFile() {
    await $`curl -o $HOME/.emubox/apps.json https://emubox-cli.github.io/apps/apps.json`;
}