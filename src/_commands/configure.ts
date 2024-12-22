import { input, select } from "@inquirer/prompts";
import { $, file } from "bun";
import { homedir } from "os";
import { join } from "path";
import apps from "../utils/apps";

const config = await file(join(homedir(), ".emubox", "config.json")).json();
config.installed = config.installed ?? [];

const which = await select({
    message: "Select an app to configure.",
    choices: apps
    .filter(d => config.installed.find(dd => dd.short === d.short))
    .concat()
    .map(d => ({
        name: d.name,
        value: d.short
    }))
});