import { rawlist } from "@inquirer/prompts";
import { $, file } from "bun";
import apps from "../utils/apps";
import { join } from "path";
import { homedir } from "os";

/*await $`
    distrobox rm -Y emubox
    rm -rf $HOME/.emubox
`*/
const config = await file(join(homedir(), ".emubox", "config.json")).json();
config.installed = config.installed ?? [];


const appsToRemove = await rawlist({
    message: "Please select apps to remove",
    choices: apps
    .filter(d => config.installed.find(dd => dd.short == d.short))
    .map(d => ({
        name: d.name,
        value: d.short
    }))
});

