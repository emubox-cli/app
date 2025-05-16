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
    if (config.customLaunchers[emuId]) {
        await $`${containerPrefix}${config.customLaunchers[emuId]} ${remainingArgs}`;
        return;
    }
    
    const targetApp = getAppFromId(emuId)!;
    const installData = config.installed.find(d => d.id === emuId);
    if (!installData) {
        if (!targetApp) 
            console.error(`'${emuId}' not found`);
        else // if (target.isRetroarchCoreOrSomething)
            console.error(`'${emuId}' not installed`);
        return;
    }

    if (targetApp.installOptions.multi) {
        targetApp.installOptions = targetApp.installOptions.multi[installData.mIndex!];
    }

    switch (installData.source) {
        case "aur": 
            await $`${containerPrefix}${targetApp?.installOptions.aurBin ?? targetApp?.installOptions.aurExportName} ${remainingArgs}`.nothrow();
            break;
        case "flatpak":
            await $`${containerPrefix}flatpak run --system ${targetApp?.installOptions.flatpak} ${remainingArgs}`.nothrow();
            break;
        case "manual":
            await $`${containerPrefix}${installData.file} ${remainingArgs}`.nothrow();
            break;
        case "github":
            await $`${containerPrefix}$HOME/.emubox/apps/${installData.file} ${remainingArgs}`.nothrow();
            break;
    }
}