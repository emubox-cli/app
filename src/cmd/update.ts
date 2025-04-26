import { $ } from "bun";
import install from "funcs/install";
import { getAppFromId } from "utils/apps";
import { openConfig, writeConfig } from "utils/config";
import containerPrefix from "utils/containerPrefix";
import getLatestRelease from "utils/getLatestRelease";
import { bold } from "yoctocolors";

export default async function() {
    const config = await openConfig();
    const aurUpdatesNeeded = await $`${containerPrefix}paru --query --upgrades`.text();
    const flatpakUpdatesNeeded = await $`${containerPrefix}flatpak list -u`.text();
    for (const i of config.installed) {
        const dumbIndex = config.installed.indexOf(i);
        console.log(bold(`[${dumbIndex+1}/${config.installed.length}] ${i.releaseId}`));
        const app = getAppFromId(i.id)!;
        switch (i.source) {
            case "aur":
                if (!aurUpdatesNeeded.includes(app.installOptions.aur!))
                    continue;

                await $`${containerPrefix}paru -S ${app?.installOptions.aurBin}`;
                break;
            case "flatpak":
                if (!flatpakUpdatesNeeded.includes(app.installOptions.flatpak!))
                    continue;

                await $`${containerPrefix}flatpak update ${app?.installOptions.flatpak}`;
                break;
            case "github":
                const latest = await getLatestRelease(app.installOptions.gitRepo!);
                if (String(latest.id) === i.releaseId) {
                    console.log(`${app.name}: Up to date`);
                    continue;
                }
                
                console.log(bold(`New release availible: ${i.releaseId} ~> ${latest.id}`));

                const targetAsset = latest.assets.find((d: { name: string }) => d.name.match(app.installOptions.gitRe!));
                if (!targetAsset) 
                    throw new Error("No asset found");
                await $`rm ~/.emubox/apps/${i.file!}`;
                console.log(`Updating ${app.name}...`);
                config.installed.splice(dumbIndex, 1);
                writeConfig(config);
                install(app.id, "github");
        }
    }

    console.log("Update the package manager itself using 'emubox-update'");
    console.log("Done!");
}