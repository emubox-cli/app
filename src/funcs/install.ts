import { $, file, sleep, write } from "bun";
import { getAppFromId } from "../utils/apps";
import { dir, InstallationTypes, openConfig, writeConfig } from "utils/config";
import chalk from "chalk";
import containerPrefix from "utils/containerPrefix";
import { homedir, platform } from "os";
import makeDesktopFile from "utils/makeDesktopFile";
import { join } from "path";
import { readdir } from "fs/promises";

export default async function(app: string, installOpt: InstallationTypes) {
    const config = await openConfig();
    const emu = getAppFromId(app);

    if (!emu) {
        console.error(`'${app}' not found`);
        return;
    }

    if (config.installed.find(d => d.id === app)) {
        console.error(chalk.yellow(`'${app}' already installed`));
        return;
    }

    const extraInstallData: any = {};
    
    try {
        switch (installOpt) {
            case "aur":
                await $`${containerPrefix}paru -S --noconfirm ${emu.installOptions.aur}`;
                await $`${containerPrefix}distrobox-export -el "none" --app ${emu.installOptions.aurBin}`;
                break;
            case "flatpak":
                if (!emu.installOptions.flatpak) 
                    throw TypeError(`No flatpak installation method availible for '${app}'`);
                await $`${containerPrefix}flatpak install -y flathub ${emu.installOptions.flatpak}`;
                if (emu.installOptions.flatpakOverrideFs === true) 
                    await $`${containerPrefix}flatpak override \
                        -u ${emu.installOptions.flatpak} \
                        --filesystem "$HOME" \
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
                if (emu.installOptions.unzipTarget) {
                    await $`curl -OL ${targetAsset.browser_download_url}`.cwd("/tmp");
                    console.log(`Unzipping ${targetAsset.name}...`);
                    if (targetAsset.name.endsWith(".tar.gz"))
                        await $`
                            mkdir ${emu.id}
                            tar -xvzf ${targetAsset.name} -C ${emu.id}
                        
                        `.quiet().cwd("/tmp");
                    else 
                        await $`${containerPrefix}unzip -q ${targetAsset.name} -d ${emu.id}`.quiet().cwd("/tmp");
                    let subDir = null;
                    if (emu.installOptions.unzipSubdir) {
                        const dir = (await readdir(join("/", "tmp", emu.id))).find(d => d.match(emu.installOptions.unzipSubdir!));
                        if (!dir)
                            throw new Error("Subdirectory specified but not found.");

                        subDir = dir + "/";
                    }
                    await $`cp ${emu.id}/${subDir}${emu.installOptions.unzipTarget} $HOME/.emubox/apps/${emu.installOptions.unzipTarget}`.cwd("/tmp");
                    targetAsset.name = emu.installOptions.unzipTarget;
                }
                else {
                    await $`curl -o $HOME/.emubox/apps/${targetAsset.name} -L ${targetAsset.browser_download_url}`;
                    await $`chmod +x $HOME/.emubox/apps/${targetAsset.name}`;
                }

                extraInstallData.file = targetAsset.name;
                
                console.log("Getting icon...");
                await $`$HOME/.emubox/apps/${targetAsset.name} --appimage-extract`.quiet().cwd("/tmp");
                await $`cp ./squashfs-root/.DirIcon $HOME/.local/share/icons/emubox/${emu.id}.png`.cwd("/tmp");
                await $`rm -rf squashfs-root`.cwd("/tmp");
                await $`xdg-icon-resource forceupdate`;
                console.log("Making desktop file...");
                write(
                    file(join(homedir(), ".local", "share", "applications", emu.id + ".desktop")),
                    makeDesktopFile({
                        name: emu.name,
                        exec: join(homedir(), ".local", "bin", "emubox") + ` run ${emu.id}`, 
                        icon: join(homedir(), ".local", "share", "icons", "emubox", emu.id + ".png")
                    })
                );
                await $`update-desktop-database ~/.local/share/applications`;
                break;
            /*case "libretro":
               // todo: download core from buildbot, disallow method if retroarch isn't installed.
               break;*/
            default:
                throw new TypeError("Invalid installation type provided");

        }

        config.installed.push({
            id: emu.id,
            source: installOpt,
            ...extraInstallData
        });

        writeConfig(config);

    } catch (e) {
        console.error(chalk.red(`Failed to install '${emu.name}': ${(e as Error).message}`));
    }
}
