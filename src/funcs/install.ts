import { $, file, sleep, write } from "bun";
import { getAppFromShort } from "../utils/apps";
import { dir, InstallationTypes, openConfig, writeConfig } from "utils/config";
import chalk from "chalk";
import containerPrefix from "utils/containerPrefix";
import { homedir, platform } from "os";
import makeDesktopFile from "utils/makeDesktopFile";
import { join } from "path";

export default async function(app: string, installOpt: InstallationTypes) {
    const config = await openConfig();
    const emu = getAppFromShort(app);

    if (!emu) {
        console.error(`'${app}' not found`);
        return;
    }

    if (config.installed.find(d => d.short === app)) {
        console.error(chalk.yellow(`'${app}' already installed`));
        return;
    }
    
    let launchCode: string = "";
    const extraInstallData: any = {};
    
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
                        --bin /usr/bin/${emu.installOptions.aurBinAlt ?? emu.installOptions.aurBin}
		        `;
                break;
            case "flatpak":
                if (!emu.installOptions.flatpak) 
                    throw TypeError(`No flatpak installation method availible for '${app}'`);
                launchCode = `flatpak run -u ${emu.installOptions.flatpak}`;
                await $`flatpak install -u ${emu.installOptions.flatpak}`;
                if (emu.installOptions.flatpakOverrideFs === true) 
                    await $`flatpak override \
                        -u ${emu.installOptions.flatpak} \
                        --filesystem home \
                        --filesystem /run/media
                    `;
                break;
            case "github":
                if (!emu.installOptions.gitRepo) 
                    throw TypeError(`No github releases availible for '${app}'`);
                console.log(`Looking for latest release at ${emu.installOptions.gitRepo}...`);
                const releases = await (await fetch(`https://api.github.com/repos/${emu.installOptions.gitRepo}/releases`) as any).json();
                let latest = releases[0];
                if (latest.prerelease) 
                    latest = releases[1];
                const targetAsset = latest.assets.find((d: { name: string }) => d.name.match(emu.installOptions.gitRe!));
                if (!targetAsset) 
                    throw new Error("No asset found");

                console.log(`Downloading ${targetAsset.name}...`);
                if (targetAsset.name.endsWith(".zip")) {
                    console.log(`Unzipping ${targetAsset.name}...`);
                    await $`curl -OL ${targetAsset.browser_download_url}`.cwd("/tmp");
                    await $`unzip -q ${targetAsset.name} -d ${emu.short}`.quiet().cwd("/tmp");
                    await $`cp ${emu.short}/${emu.installOptions.unzipTarget} $HOME/.emubox/apps/${emu.installOptions.unzipTarget}`.cwd("/tmp");
                    targetAsset.name = emu.installOptions.unzipTarget;
                }
                else {
                    await $`curl -o $HOME/.emubox/apps/${targetAsset.name} -L ${targetAsset.browser_download_url}`;
                    await $`chmod +x $HOME/.emubox/apps/${targetAsset.name}`;
                }

                extraInstallData.file = targetAsset.name;
                launchCode = `${containerPrefix}${homedir()}/.emubox/apps/${targetAsset.name}`;
                
                console.log("Getting icon...");
                await $`$HOME/.emubox/apps/${targetAsset.name} --appimage-extract`.quiet().cwd("/tmp");
                await $`cp ./squashfs-root/.DirIcon $HOME/.local/share/icons/emubox/${emu.short}.png`.cwd("/tmp");
                await $`rm -rf squashfs-root`.cwd("/tmp");
                await $`xdg-icon-resource forceupdate`;
                console.log("Making desktop file...");
                write(
                    file(join(homedir(), ".local", "share", "applications", emu.short + ".desktop")),
                    makeDesktopFile({
                        name: emu.name,
                        exec: join(homedir(), ".emubox", "apps", targetAsset.name), 
                        icon: join(homedir(), ".local", "share", "icons", "emubox", emu.short + ".png")
                    })
                );
                break;
            /*case "libretro":
               // todo: download core from buildbot, disallow method if retroarch isn't installed.
               break;*/
            default:
                throw new TypeError("Invalid installation type provided");

        }

        if (emu.makeLauncher !== false) {
            console.log("Writing launcher file...");
            write(
                file(dir("launchers", `${emu.short}.sh`)),
                `#!/bin/bash\n${launchCode} "$@"`
            );
        }
        await $`chmod +x $HOME/.emubox/launchers/${emu.short}.sh`;
        config.installed.push({
            short: emu.short,
            source: installOpt,
            ...extraInstallData
        });

        writeConfig(config);

    } catch (e) {
        console.error(chalk.red(`Failed to install '${emu.name}': ${(e as Error).message}`));
    }
}
