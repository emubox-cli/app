import { $ } from "bun";
import apps, { getAppFromId } from "utils/apps";
import { openConfig, writeConfig } from "../utils/config";
import containerPrefix from "utils/containerPrefix";

export default async function(app: string) {
    const config = await openConfig();
    const target = config.installed.find(d => d.id === app);
    const emuMin = apps.a[apps.a.findIndex(a => a.i === app)!];
    
    if (!emuMin) {
        console.error(`'${app}' not found`);
        return;
    }
    
    if (!target) {
        console.error(`'${app}' isn't installed`);
        return;
    }

    /*if (emu.id === "srm") {
        console.log("Removing all SRM parsers from your steam library...");
        await $`emubox run srm disable --all`;
        
        await killSteam();
        await $`emubox run srm nuke`.quiet();   
    }*/
    
    
    const emu = await getAppFromId(app);
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
            console.log("Removing icon and desktop files...");
            await $`
                rm ${target.exec}
                rm $HOME/.local/share/applications/${target.id}.desktop
                rm $HOME/.emubox/.icons/${target.id}.png
            `.nothrow();
            // await $`rm $HOME/.local/share/icons/emubox/${target.id}.png`;
            break;
        case "manual":
            console.log("Renaming executable...");
            let suffix = target.exec.split("/").pop();
            if (!suffix?.includes(".")) {
                suffix = "";
            }else {
                suffix = "." + suffix.split(".").pop();
            }
            await $`mv ${target.exec} $HOME/.emubox/apps/_${target.id}${suffix}`;
            await $`
                rm $HOME/.local/share/applications/${target.id}.desktop
                rm $HOME/.emubox/.icons/${target.id}.png
            `.nothrow();

            console.log(`The executable you provided will remain availible at '~/.emubox/_${target.id}${suffix}'.`);
    }

    config.installed.splice(
        config.installed.indexOf(target),
        1
    );

    
    writeConfig(config);
    /*if (config.installed.find(app => app.id === "srm")) {
        await $`emubox run srm remove`.quiet();
        
        if (userConfiguratons.find(d => d.configTitle === ogName) || emu.srmParsers) {
            console.log("Removing", app);
            await $`emubox run srm disable --names "${ogName}"`.quiet();
        }
        if (emu.srmParsers) {
            console.log("Removing", emu.srmParsers.map(d => `"${d}"`).join(" "));
            await $`emubox run srm disable --names ${emu.srmParsers.map(d => `"${d}"`).join(" ")}`.quiet();
        }
        await generateManifest("emulators");
                
        await killSteam();
        console.log("Removing games to your steam library...");
        await $`emubox run srm add`.quiet();
    }*/

    console.log(`'${target.id}' has been removed.`);
}