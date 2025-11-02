import { $, write } from "bun";
import apps, { getAppFromId, REQUEST_DOMAIN } from "utils/apps";
import { dir, InstallationTypes, openConfig, writeConfig } from "utils/config";
import { yellow, red } from "yoctocolors";
import containerPrefix from "utils/containerPrefix";
import { homedir } from "os";
import makeDesktopFile from "utils/makeDesktopFile";
import { join } from "path";
import { readdir, exists } from "fs/promises";
import confirm from "@inquirer/confirm";
import input from "@inquirer/input";
import select from "@inquirer/select";
import { getLatestRelease, getTaggedRelease } from "utils/releases";

// import userConfigurations from "utils/userConfigurations.json";
// import { generateManifest } from "utils/manifests";
// import killSteam from "utils/killSteam";
import makeIni from "utils/makeIni";

export default async function(app: string, installOpt: InstallationTypes) {
    let ghTag = "";
    if (installOpt === "github" && app.includes("@")) {
        const split = app.split("@");
        app = split[0];
        ghTag = split[1];
    }
    const config = await openConfig();
    const emuMin = apps.a[apps.a.findIndex(a => a.i === app)!];
    const appData = config.installed.find(d => d.id === app);

    if (!emuMin) {
        console.error(`'${app}' not found`);
        return;
    }
    // const ogName = emu!.name;

    if (appData && !ghTag) {
        console.error(yellow(`'${app}' already installed`));
        return;
    }

    let manualPath: string = "";
    let exec: string = "";

    if (emuMin.o.includes("m")) {
        console.warn(`${emuMin.n} cannot be installed directly by emubox, you must provide your own appimage/binary of it.`);
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

        console.log("This file will be moved to '~/.emubox/apps'.");
        let suffix = manualPath.split("/").pop();
        // it's a binary
        if (!suffix?.includes(".")) {
            suffix = "";
        } else {
            suffix = "." + suffix.split(".").pop();
        }
        await $`mv ${manualPath} $HOME/.emubox/apps/${emuMin.i}${suffix}`;

        exec = join(homedir(), ".emubox", "apps", emuMin.i + suffix);

        installOpt = "manual";
    }
    const extraInstallData: { releaseId?: string, tag?: string } = {};
    
    console.log("Getting install data...");
    
    try {
        // skip getting app data
        if (installOpt === "manual")
            await prepExecutable(exec, emuMin.i, emuMin.n);
        else {
            const emu = await getAppFromId(app);

    
            switch (installOpt) {
                case "aur":
                    await $`${containerPrefix}paru -S --noconfirm ${emu.installOptions.aur}`;
                    await $`${containerPrefix}distrobox-export -el "none" --app ${emu.installOptions.aurExportName ?? emu.installOptions.aurBin}`;
    
                    exec = (emu.installOptions.aurBin ?? emu.installOptions.aurExportName)!;
                    break;
                case "flatpak":
                    if (!emu.installOptions.flatpak) 
                        throw TypeError(`No flatpak installation method availible for '${app}'`);
                    await $`
                        ${containerPrefix}flatpak install -y flathub ${emu.installOptions.flatpak}
                        ${containerPrefix}flatpak override \
                            -u ${emu.installOptions.flatpak} \
                            --filesystem=~/.emubox
                    `;
                    if (emu.installOptions.flatpakOverrideFs === true) 
                        await $`${containerPrefix}flatpak override \
                            -u ${emu.installOptions.flatpak} \
                            --filesystem home \
                            --filesystem=/media \
                            --filesystem=/run/media
                        `;
                    exec = emu.installOptions.flatpak;
                    break;
                case "github":
                    if (!emu.installOptions.gitRepo) 
                        throw TypeError(`No github releases availible for '${app}'`);

                    let release;
                    if (ghTag) {
                        console.log(`Looking for tagged release: ${emu.installOptions.gitRepo}@${ghTag}`);
                        release = await getTaggedRelease(emu.installOptions.gitRepo, ghTag);
                    } else {
                        console.log(`Looking for latest release at ${emu.installOptions.gitRepo}...`);
                        release = await getLatestRelease(emu.installOptions.gitRepo);
                    }

                    if (!release)
                        throw new Error("Release not found");
                    
                    let targetAsset;
                    targetAsset = release.assets.find((d: { name: string }) => d.name.match(emu.installOptions.gitRe!));

                    if (!targetAsset) {
                        const appimages = release.assets.filter(d => d.name.toLowerCase().endsWith(".appimage"));
                        if (!appimages.length)
                            throw new Error("No asset found");
                        

                        console.log("Couldn't find pre-queried file to download");
                        const filename = await select({
                            message: "Please select the appimage to download.",
                            choices: release.assets.filter(d => d.name.toLowerCase().endsWith(".appimage")).map(d => d.name)
                        });

                        targetAsset = release.assets.find(d => d.name === filename);

                    }
                        
    
                    console.log(`Downloading ${targetAsset.name}...`);
                    if (emu.installOptions.unzipTarget) {
                        await $`curl -OL ${targetAsset.browser_download_url}`.cwd("/tmp");
                        console.log(`Unzipping ${targetAsset.name}...`);
                        if (targetAsset.name.endsWith(".tar.gz"))
                            await $`
                                mkdir ${emuMin.i}
                                tar -xvzf ${targetAsset.name} -C ${emuMin.i}
                            `.quiet().cwd("/tmp");
                        else 
                            await $`${containerPrefix}unzip -q ${targetAsset.name} -d ${emuMin.i}`.quiet().cwd("/tmp");
                        let subDir = "";
                        if (emu.installOptions.unzipSubdir) {
                            const dir = (await readdir(join("/", "tmp", emuMin.i))).find(d => d.match(emu.installOptions.unzipSubdir!));
                            if (!dir)
                                throw new Error("Subdirectory specified but not found.");
    
                            subDir = dir + "/";
                        }
                        await $`
                            cp ${emuMin.i}/${subDir}${emu.installOptions.unzipTarget} $HOME/.emubox/apps/${emu.installOptions.unzipTarget}
                            rm -rf ${emuMin.i}
                        `.cwd("/tmp");
                        targetAsset.name = emu.installOptions.unzipTarget;
                    } else {
                        await $`curl -o $HOME/.emubox/apps/${targetAsset.name} -L ${targetAsset.browser_download_url}`;
                    }
    
                    extraInstallData.releaseId = String(release.id);
                    if (ghTag) 
                        extraInstallData.tag = ghTag;

                    prepExecutable(join(homedir(), ".emubox", "apps", targetAsset.name), emuMin.i, emu.name);

                    exec = join(homedir(), ".emubox", "apps", targetAsset.name);

    
                    break;
                /*case "libretro":
                   // todo: download core from buildbot, disallow method if retroarch isn't installed.
                   break;*/
                default:
                    throw new TypeError("Invalid installation type provided");
    
            }

       
            /*if (config.installed.find(d => d.id === "srm")) {
            console.log("Enabling SRM parsers...");
            if (userConfigurations.find(d => d.configTitle === ogName) || emu.srmParsers) {
                console.log("Adding", ogName);
                await $`emubox run srm enable --names "${ogName}"`.quiet();
            }
            if (emu.srmParsers) {
                console.log("Adding", emu.srmParsers.map(d => `"${d}"`).join(" "));
                await $`emubox run srm enable --names ${emu.srmParsers.map(d => `"${d}"`).join(" ")}`.quiet();
            }
        }*/

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
    
                for (const dir of emu.postInstall.makeDirs) {
                    const finalDir = dir
                        .replaceAll("<save>", config.saveDir)
                        .replaceAll("<share>", sharePath)
                        .replaceAll("<config>", configPath)
                        .replaceAll("<id>", emuMin.i);

                    // console.log(`Making ${finalDir}...`);
                    await $`mkdir -p ${finalDir}`;
                }
    
                for (const file of emu.postInstall.makeFiles) {
                    const finalPath = file.path
                        .replaceAll("<save>", config.saveDir)
                        .replaceAll("<share>", sharePath)
                        .replaceAll("<config>", configPath)
                        .replaceAll("<id>", emuMin.i);
                
                    let content: string = "";
                    switch (file.path.split(".").pop()) {
                        case "cfg":
                        case "ini":
                        case "conf":
                        case "toml":
                            console.log("Writing ini-like config...");
                            content = makeIni(file.content, config.saveDir, emuMin.i);
                            break;
                        default:
                            console.log("lol");

                    }

                    if (!await exists(finalPath)) {
                        write(
                            finalPath,
                            content
                        );
                    }
                }
            }
        }
        
        config.installed.push({
            id: emuMin.i,
            source: installOpt,
            exec,
            ...extraInstallData
        });

        writeConfig(config);
        /*if (config.installed.find(app => app.id === "srm")) {
            if (!emu.consoles.includes("#util"))
                await generateManifest("emulators");

            if (emuMin.i === "srm") {
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
                
            if (await confirm({
                message: "Would you like to run steam rom manager?"
            })) {
                await killSteam();
                console.log("Adding games to your steam library...");
                await $`emubox run srm add`; 
            }
            
             
        }*/

    } catch (e) {
        console.error(red(`Failed to install '${emuMin.n}': ${(e as Error).message}\n${(e as Error).stack}`));
    }
}

async function prepExecutable(filePath: string, id: string, name: string) {
    await $`chmod +x ${filePath}`;
    if (filePath.toLowerCase().endsWith(".appimage") && id !== "ppsspp") {
        console.log("Getting icon...");
        await $`${filePath} --appimage-extract`.quiet().cwd("/tmp");
        await $`cp ./squashfs-root/.DirIcon $HOME/.emubox/.icons/${id}.png`.cwd("/tmp");
        await $`rm -rf squashfs-root`.cwd("/tmp");
        
    } else {
        console.log("Downloading icon...");
        await $`curl -o $HOME/.emubox/.icons/${id}.png ${REQUEST_DOMAIN}icons/${id}.png`;
    }

    await $`xdg-icon-resource forceupdate`;
    
    console.log("Making desktop file...");
    makeDesktopFile(id, {
        name,
        exec: id,
        icon: dir(".icons", id + ".png") 
    });
}