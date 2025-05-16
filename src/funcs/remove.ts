import { $ } from "bun";
import { getAppFromId } from "../utils/apps";
import { openConfig, writeConfig } from "../utils/config";
import containerPrefix from "utils/containerPrefix";

export default async function(app: string) {
    const config = await openConfig();
    const target = config.installed.find(d => d.id === app);
    const emu = getAppFromId(app);
    
    if (!emu) {
        console.error(`'${app}' not found`);
        return;
    }
    
    if (!target) {
        console.error(`'${app}' isn't installed`);
        return;
    }

    if (emu.installOptions.multi) {
        emu.installOptions = emu.installOptions.multi[target.mIndex!];
    }
    
    switch (target.source) {
        case "aur":
            await $`
                ${containerPrefix}distrobox-export \
                    --app ${emu.installOptions.aurExportName ?? emu.installOptions.aurBin} \
                    --delete
            `.nothrow();
            await $`${containerPrefix}paru -Rs --noconfirm ${emu.installOptions.aur}`;
            break;
        case "flatpak":
            await $`flatpak remove -y ${emu.installOptions.flatpak}`;
            break;
        case "github":
            console.log("Removing executable...");
            await $`rm $HOME/.emubox/apps/${target.file!}`;
            console.log("Removing icon and desktop files...");
            await $`rm $HOME/.local/share/applications/${target.id}.desktop`;
            await $`rm $HOME/.local/share/icons/emubox/${target.id}.png`;
            break;
        case "manual":
            console.log("Removing icon and desktop files...");
            await $`rm $HOME/.local/share/applications/${target.id}.desktop`;
            await $`rm $HOME/.local/share/icons/emubox/${target.id}.png`;
    
    }

    config.installed.splice(
        config.installed.indexOf(target),
        1
    );

    
    writeConfig(config);

    console.log(`'${target.id}' has been removed.`);
}