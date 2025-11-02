import { $ } from "bun";
import install from "funcs/install";
import { getAppFromId } from "utils/apps";
import { openConfig, writeConfig } from "utils/config";
import containerPrefix from "utils/containerPrefix";
import getAppFile from "utils/getAppFile";
import { getLatestRelease } from "utils/releases";
import { bold, green, red, yellow } from "yoctocolors";

export default async function() {
    await getAppFile();
    await $`${containerPrefix}paru -Syy`;
    console.log("Updating apps...");
    const config = await openConfig();
    const aurUpdatesNeeded = await $`${containerPrefix}paru --query --upgrades`.nothrow().text();
    const flatpakUpdatesNeeded = await $`${containerPrefix}flatpak list -u`.nothrow().text();
    
    for (const i of config.installed) {
        const dumbIndex = config.installed.indexOf(i);
        const app = (await getAppFromId(i.id))!;
        console.log(bold(`[${dumbIndex+1}/${config.installed.length}] ${app.name}`));

        try {
            switch (i.source) {
                case "aur":
                    if (!aurUpdatesNeeded.includes(app.installOptions.aur!)) {
                        console.log(green(`Up to date`));
                        continue;
                    }
    
                    await $`${containerPrefix}paru -S --noconfirm ${app?.installOptions.aur}`;
                    break;
                case "flatpak":
                    if (!flatpakUpdatesNeeded.includes(app.installOptions.flatpak!)) {
                        console.log(green(`Up to date`));
                        continue;
                    }
    
                    await $`${containerPrefix}flatpak update ${app?.installOptions.flatpak}`;
                    break;
                case "github":
                    if (i.tag) {
                        console.log(yellow("Tagged release installed, skipping."));
                        continue;
                    }
                    
                    const latest = await getLatestRelease(app.installOptions.gitRepo!);
                    if (String(latest.id) === i.releaseId) {
                        console.log(green(`Up to date`));
                        continue;
                    }
                    
                    console.log(bold(`New release availible: ${i.releaseId} ~> ${latest.id}`));
    
                    const targetAsset = latest.assets.find((d: { name: string }) => d.name.match(app.installOptions.gitRe!));
                    if (!targetAsset) 
                        throw new Error("No asset found");
                    await $`rm ${i.exec}`;
                    console.log(`Updating ${app.name}...`);
                    config.installed.splice(dumbIndex, 1);
                    writeConfig(config);
                    await install(i.id, "github");
            }
        } catch (e) {
            console.log(red(`Failed to update '${app.name}'`), e);
        }
    }
    // console.log("Update the package manager itself using 'emubox-update'");
}