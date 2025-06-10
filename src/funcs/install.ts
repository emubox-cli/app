import { $, file, write } from "bun";
import { getAppFromId } from "utils/apps";
import { InstallationTypes, openConfig, writeConfig } from "utils/config";
import { yellow, red } from "yoctocolors";
import containerPrefix from "utils/containerPrefix";
import { homedir } from "os";
import makeDesktopFile from "utils/makeDesktopFile";
import { join } from "path";
import { readdir, exists } from "fs/promises";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import input from "@inquirer/input";
import getLatestRelease from "utils/getLatestRelease";

import userConfigurations from "utils/userConfigurations.json";
import { generateManifest } from "utils/manifests";
import killSteam from "utils/killSteam";

export default async function(app: string, installOpt: InstallationTypes) {
    const config = await openConfig();
    const emu = getAppFromId(app);
    const appData = config.installed.find(d => d.id === app);

    if (!emu) {
        console.error(`'${app}' not found`);
        return;
    }
    const ogName = emu!.name;

    if (appData) {
        let appName = app;
        if (emu.installOptions.multi) {
            appName += `:${emu.installOptions.multi[appData.mIndex!].multiId}`;
        }
        console.error(yellow(`'${appName}' already installed`));
        return;
    }

    let manualPath: string = "";

    if (emu.installOptions.manual) {
        console.warn(`${emu.name} cannot be installed by emubox, you must provide your own appimage/binary of it.`);
        // would you like to provide it now
        const provideNow = await confirm({
            message: "Would you like to provide it now?",
            default: true
        });

        if (!provideNow) 
            return;

        manualPath = await input({
            message: "Provide the path to your appimage/binary file:"
        });

        if (!await exists(manualPath)) {
            console.log("Invalid path provided.");
            return;
        }

        installOpt = "manual";
    }
    
    let selectIndex: number = -1;
    if (emu.installOptions.multi) {
        const choices = emu.installOptions.multi.map(d => d.multiId!);
        selectIndex = choices.indexOf(await select({
            message: `There are multiple installation choices for ${emu.name}, please select one.`,
            choices
        }));

        emu.installOptions = emu.installOptions.multi[selectIndex];
        emu.name = emu.installOptions.multiName!;
    }

    const extraInstallData: { file?: string, releaseId?: string, mIndex?: number } = {};

    if (selectIndex !== -1) 
        extraInstallData.mIndex = selectIndex;
    
    try {
        switch (installOpt) {
            case "aur":
                await $`${containerPrefix}paru -S --noconfirm ${emu.installOptions.aur}`;
                await $`${containerPrefix}distrobox-export -el "none" --app ${emu.installOptions.aurExportName ?? emu.installOptions.aurBin}`;
                break;
            case "flatpak":
                if (!emu.installOptions.flatpak) 
                    throw TypeError(`No flatpak installation method availible for '${app}'`);
                await $`${containerPrefix}flatpak install -y flathub ${emu.installOptions.flatpak}`;
                if (emu.installOptions.flatpakOverrideFs === true) 
                    await $`${containerPrefix}flatpak override \
                        -u ${emu.installOptions.flatpak} \
                        --filesystem home \
                        --filesystem=/media \
                        --filesystem=/run/media
                    `;
                break;
            case "github":
                if (!emu.installOptions.gitRepo) 
                    throw TypeError(`No github releases availible for '${app}'`);
                console.log(`Looking for latest release at ${emu.installOptions.gitRepo}...`);
                const latest = await getLatestRelease(emu.installOptions.gitRepo);
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
                    let subDir = "";
                    if (emu.installOptions.unzipSubdir) {
                        const dir = (await readdir(join("/", "tmp", emu.id))).find(d => d.match(emu.installOptions.unzipSubdir!));
                        if (!dir)
                            throw new Error("Subdirectory specified but not found.");

                        subDir = dir + "/";
                    }
                    await $`
                        cp ${emu.id}/${subDir}${emu.installOptions.unzipTarget} $HOME/.emubox/apps/${emu.installOptions.unzipTarget}
                        rm -rf ${emu.id}
                    `.cwd("/tmp");
                    targetAsset.name = emu.installOptions.unzipTarget;
                }
                else {
                    await $`curl -o $HOME/.emubox/apps/${targetAsset.name} -L ${targetAsset.browser_download_url}`;
                    await $`chmod +x $HOME/.emubox/apps/${targetAsset.name}`;
                }

                extraInstallData.file = targetAsset.name;
                extraInstallData.releaseId = String(latest.id);
                
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
                break;
            case "manual":
                await $`chmod +x ${manualPath}`;
                if (manualPath.toLowerCase().endsWith("appimage")) {
                    console.log("Getting icon...");
                    await $`${manualPath} --appimage-extract`.quiet().cwd("/tmp");
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
                }
                extraInstallData.file = manualPath;
                
                break;
            /*case "libretro":
               // todo: download core from buildbot, disallow method if retroarch isn't installed.
               break;*/
            default:
                throw new TypeError("Invalid installation type provided");

        }

        if (config.installed.find(d => d.id === "srm")) {
            console.log("Enabling SRM parsers...");
            if (userConfigurations.find(d => d.configTitle === ogName) || emu.srmParsers) {
                console.log("Adding", ogName);
                await $`emubox run srm enable --names "${ogName}"`.quiet();
            }
            if (emu.srmParsers) {
                console.log("Adding", emu.srmParsers.map(d => `"${d}"`).join(" "));
                await $`emubox run srm enable --names ${emu.srmParsers.map(d => `"${d}"`).join(" ")}`.quiet();
            }
        }
        
        

        if (emu.postInstall) {
            let basePath = "";
            switch (installOpt) {
                case "flatpak":
                    basePath = join(homedir(), ".var", "app", emu.installOptions.flatpak!);
                    break;
                default:
                    basePath = join(homedir(), ".emubox");
                    break;
            }
    
            let configPath = "";
            switch (installOpt) {
                case "flatpak":
                    configPath = join(basePath, "config");
                    break;
                default:
                    configPath = join(basePath, ".config");
                    break;
            }
    
            let sharePath = "";
            switch (installOpt) {
                case "flatpak":
                    sharePath = join(basePath, "data");
                    break;
                default:
                    sharePath = join(basePath, ".local", "share");
                    break;
            }
    
            console.log(`post-install[${emu.id}]`);
            for (const dir of emu.postInstall.makeDirs) {
                const finalDir = dir
                    .replaceAll("<save>", config.saveDir)
                    .replaceAll("<share>", sharePath)
                    .replaceAll("<config>", configPath)
                    .replaceAll("<id>", emu.installOptions.multiId ?? emu.id);

                // console.log(`Making ${finalDir}...`);
                await $`mkdir -p ${finalDir}`;
            }
    
            for (const file of emu.postInstall.makeFiles) {
                const finalPath = file.path
                    .replaceAll("<save>", config.saveDir)
                    .replaceAll("<share>", sharePath)
                    .replaceAll("<config>", configPath)
                    .replaceAll("<id>", emu.installOptions.multiId ?? emu.id);

                if (!await exists(finalPath)) {
                    write(
                        finalPath,
                        file.content
                            .replaceAll("<save>", config.saveDir)
                            .replaceAll("<id>", emu.installOptions.multiId ?? emu.id)
                    );
                }
            }
        }

        switch (emu.id) {
            /*case "citron":
            case "sudachi":
            case "torzu":
            case "eden":
                lePath = join(lePath, emu.id);

                await $`
                    mkdir -p ${lePath}
                    mkdir -p ${config.saveDir}/${emu.id}/nand
                    mkdir -p ${config.saveDir}/${emu.id}/sdmc
                `;

                write(
                    join(lePath, "qt-config.ini"),
                    `[Data%20Storage]\nsdmc_directory=${config.saveDir}/${emu.id}/sdmc\nnand_directory=${config.saveDir}/${emu.id}/nand`
                );
                break;
            case "melonds":
                break;
            case "dolphin-emu":
                switch (installOpt) {
                    case "aur":
                    case "github": 
                        lePath = join(lePath, "..", ".local", "share");
                }

                lePath = join(lePath, "dolphin-emu");

                await $`
                    mkdir -p ${config.saveDir}/dolphin-emu
                    mkdir -p ${lePath}/Wii
                    mkdir -p ${lePath}/GC

                    ln -s ${lePath}/GC ${config.saveDir}/dolphin-emu
                    ln -s ${lePath}/Wii ${config.saveDir}/dolphin-emu
                `;
                break;
                
            case "mgba":
                // patch based on 0.10.5
                console.log("post-install[mgba]: overwriting config...");

                lePath = join(lePath, "mgba");

                await $`mkdir -p ${lePath}`;
                await $`mkdir -p ${config.saveDir}/mgba/states`;

                write(
                    join(lePath, "config.ini"),
                    `[ports.qt]\nsavegamePath=${join(config.saveDir, "mgba")}\nsavestatePath=${join(config.saveDir, "mgba", "states")}`
                );
                break;

            case "snes9x":
                // patch based on 1.63
                console.log("post-install[snes9x]: overwriting config...");
                let path = "";
                switch (installOpt) {
                    case "aur":
                    case "github":
                        path = join(homedir(), ".emubox", ".config");
                        break;
                    case "flatpak":
                        path = join(homedir(), ".var", "app", emu.installOptions.flatpak!, "config");
                        break;
                }

                path = join(path, "snes9x");

                await $`mkdir -p ${path}`;
                await $`mkdir -p ${config.saveDir}/snes9x/states`;

                // config file reference:
                // https://raw.githubusercontent.com/snes9xgit/snes9x/refs/heads/master/unix/snes9x.conf.default
                write(
                    join(path, "snes9x.conf"),
                    `[Files]\nSRAMDirectory=${join(config.saveDir, "snes9x")}\nSaveStateDirectory=${join(config.saveDir, "snes9x", "states")}`
                );

                break;
            */
            case "srm":
                console.log("post-install[srm]: adding custom parser list...");
                let srmPath = "";
                switch (installOpt) {
                    case "aur":
                    case "github":
                        srmPath = join(homedir(), ".emubox", ".config");
                        break;
                    case "flatpak":
                        srmPath = join(homedir(), ".var", "app", emu.installOptions.flatpak!, "config");
                        break;
                }
                srmPath = join(srmPath, "steam-rom-manager", "userData");
    
                await $`mkdir -p ${srmPath}`;
                for (const parser of userConfigurations) {
                    if (parser.parserType === "Manual") 
                        parser.parserInputs.manualManifests = parser.parserInputs.manualManifests?.replace("<emubox>", join(homedir(), ".emubox"));
                    parser.romDirectory = parser.romDirectory.replace("<emubox>", join(homedir(), ".emubox"));
                    parser.executable.path = parser.executable.path.replace("<emubox-bin>", join(homedir(), ".local", "bin", "emubox"));
                }
    
                if (!await exists(join(srmPath, "userConfigurations.json")))
                    write(
                        join(srmPath, "userConfigurations.json"),
                        JSON.stringify(userConfigurations)
                    );
                break;
        }

        config.installed.push({
            id: emu.id,
            source: installOpt,
            ...extraInstallData
        });

        writeConfig(config);
        if (config.installed.find(app => app.id === "srm")) {
            if (!emu.consoles.includes("#util"))
                await generateManifest("emulators");

            if (emu.id === "srm") {
                await $`emubox run srm remove`.quiet();

                await $`
                    emubox run srm enable --names "Emulators" ${
                    config.installed
                        .filter(d => d.id !== "srm")
                        .map(d => {
                            const app = getAppFromId(d.id);
                            if (app?.srmParsers) {
                                return app.srmParsers.map(dd => `"${dd}"`);
                            }
                            return `"${app?.name}"`;
                        })
                    }
                `;

            }
                
            
            await killSteam();
            console.log("Adding games to your steam library...");
            await $`emubox run srm add`;   
        }

    } catch (e) {
        console.error(red(`Failed to install '${emu.name}': ${(e as Error).message}\n${(e as Error).stack}`));
    }
}