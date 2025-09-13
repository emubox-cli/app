import { $ } from "bun";
import { getAppFromId } from "utils/apps";
import { openConfig } from "utils/config";
import containerPrefix from "utils/containerPrefix";

const HELP_MSG = 
    `
emubox run: emubox run <EMULATOR_ID> [...args]
    Launch an installed emulator.
`;
export default async function(...remainingArgs: string[]) {
    const emuId = remainingArgs.shift();
    if (!emuId) {
        console.log(HELP_MSG);
        return;
    }

    const config = await openConfig();
    const targetApp = await getAppFromId(emuId)!;
    const installData = config.installed.find(d => d.id === emuId);
    if (!installData) {
        if (!targetApp) 
            console.error(`'${emuId}' not found`);
        else // if (target.isRetroarchCoreOrSomething)
            console.error(`'${emuId}' not installed`);
        return;
    }

    switch (installData.source) {
        case "aur":
        case "github":
        case "manual": 
            await $`${containerPrefix}${installData.exec} ${remainingArgs}`.nothrow();
            break;
        case "flatpak":
            await $`${containerPrefix}flatpak run --system ${installData.exec} ${remainingArgs}`.nothrow();
            break;
    }
}