import { $, file, write } from "bun";
import { getAppFromShort } from "../utils/apps";
import { dir, InstallationTypes, openConfig, writeConfig } from "utils/config";
import chalk from "chalk";
import containerPrefix from "utils/containerPrefix";

export default async function(app: string, installOpt: InstallationTypes) {
    const config = await openConfig();
    const emu = getAppFromShort(app);

    if (!emu) {
        console.error(`'${app}' not found`);
        return;
    }

    if (config.installed.find(d => d.short === app)) {
        console.error(chalk.yellow(`${app} already installed`));
        return;
    }
    
    let launchCode: string = "";
    
    try {
        switch (installOpt) {
            case "aur":
                // todo: fix exported app not launching in steam game mode
                launchCode = `~/.local/bin/${emu.installOptions.aurBinAlt ?? emu.installOptions.aurBin}`;
                await $`${containerPrefix}paru -S --noconfirm ${emu.installOptions.aur}`;
                await $`${containerPrefix}distrobox-export -el "none" --app ${emu.installOptions.aurBin}`;
                await $`
                    ${containerPrefix}distrobox-export \
                        -el "none" \
                        --bin /usr/bin/${emu.installOptions.aurBinAlt ?? emu.installOptions.aurBin} \
                        --export-path $HOME/.local/bin
                `;
                break;
            /*case "flatpak":
                launchCode = `flatpak run -u ${emu.installOptions.flatpak}`;
                await $`distrobox-host-exec flatpak install -u ${emu.installOptions.flatpak}`;
                if (emu.installOptions.flatpakOverrideFs === true) 
                    await $`distrobox-host-exec flatpak override \
                        -u ${emu.installOptions.flatpak} \
                        --filesystem home \
                        --filesystem /run/media
                    `;
                break;
            case "github":
                // launchCode = `$HOME/.emuboxs/apps/`
                await $`curl https://api.github.com/repos/${emu.installOptions.github}/releases`;
                const latestRelease = (await (await fetch(`https://api.github.com/repos/${emu.installOptions.github}/releases`)).json())[0];
                const targetAsset = latestRelease.assets.find(d => d.name.match(emu.installOptions.githubRe!));
                if (!targetAsset) {
                    await
                }
                
                break;
            case "libretro":
               // todo: download core from buildbot, disallow method if retroarch isn't installed.
            */
        }

        if (emu.makeLauncher !== false)
            write(
                file(dir("launchers", `${emu.short}.sh`)),
                `#!/bin/bash\n${launchCode} "$@"`
            );
        await $`chmod +x $HOME/.emubox/launchers/${emu.short}.sh`;

        config.installed.push({
            short: emu.short,
            source: installOpt
        });

        writeConfig(config);

    } catch (e) {
        console.error(chalk.red(`Failed to install ${emu.name}: ${(e as Error).message}`));
    }
}
