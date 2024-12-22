import { join } from "path";
import { homedir } from "os";
import { $, write, sleep, file, ShellError } from "bun";
import { checkbox, confirm, select } from "@inquirer/prompts";
import chalk from "chalk";
import apps, { getAppFromShort } from "../utils/apps";

async function _install() {
    const config = await file(join(homedir(), ".emubox", "config.json")).json();
    config.installed = config.installed ?? [];

    const response = await checkbox({
        loop: false,
        message: chalk.bgWhite.black.bold("🎮 Emubox > Installer") + "\nSelect the apps you would like to install",
        choices: apps
            .filter(d => !config.installed.find(k => k.short === d.short))
            .map((d, i) => ({
                name: d.name,
                value: {
                    short: d.short,
                    source: d.installOptions.aur ? "aur" : "libretro"
                }
            })),
        theme: {
            prefix: "",
            helpMode: "auto",
            icon: {
                cursor: ">",
                checked: chalk.green(" +"),
                unchecked: chalk.red(" -")
            },
            style: {
                renderSelectedChoices: _ => ""
            }
        }
    });

    if (response.length === 0) {
        console.log(chalk.yellow("No selections. Returning to main menu..."));
        await sleep(1e3);
        import("../main");
        return;
    }
    
    const res = await confirm({
        message: "Would you like to configure installation sources? (By default, most apps provided in emubox are built from AUR)"
    });

    if (res) {
        console.clear();
        let configTarget = await select({
            message: "Select an app to change it's source.",
            choices: [
                {
                    name: "Exit",
                    value: {
                        short: "exit",
                        source: ""
                    }
                },
                ...response
                .map(d => ({ 
                    name: getAppFromShort(d.short)!.name + ` (${d.source.toUpperCase()})`,
                    value: d
                }))
            ]
        });

        while (configTarget.short !== "exit") {
            const emu = getAppFromShort(configTarget.short)!;

            const choices: string[] = [];
            if (emu.installOptions.aur) 
                choices.push("aur");
            if (emu.installOptions.flatpak)
                choices.push("flatpak");
            if (emu.installOptions.github)
                choices.push("github");
            if (emu.installOptions.libretroCore)
                choices.push("libretro");

            const newSource = await select({
                message: "Select an installation source.",
                default: configTarget.source,
                choices: choices.map(d => ({ 
                    name: d, 
                    value: d 
                }))
            });

            configTarget.source = newSource;

            configTarget = await select({
                message: "Select an app to change it's source.",
                choices: [
                    {
                        name: "Exit",
                        value: {
                            short: "exit",
                            source: ""
                        }
                    },
                    ...response
                        .map(d => ({
                            name: getAppFromShort(d.short)!.name + ` (${d.source.toUpperCase()})`,
                            value: d
                        }))
                ]
            });
        }
        console.clear();
    }

    console.log(response.map(d => chalk.green(`+ ${getAppFromShort(d.short)!.name} (${d.source.toUpperCase()})`)).join("\n"));

    const ret = await confirm({
        message: `${response.length} app(s) selected. Begin installation?`
    });

    if (!ret) {
        console.log(chalk.yellow("Confirmation rejected. Returning to main menu..."));
        await sleep(1e3);
        import("../main");
        return;
    }

    console.log(chalk.cyan("Installing selected apps shortly!"));
    console.log(chalk.yellow("Please do not input while this is happening."));
    await sleep(2e3);

    let successes = 0;
    for (const i of response) {
        const emu = getAppFromShort(i.short)!;
        let launchCode: string = "";
        try {
            switch (i.source) {
                case "aur":
                    launchCode = emu.installOptions.aurBin!;
                    await $`paru -S --noconfirm ${emu.installOptions.aur}`
                    await $`distrobox-export --app ${emu.installOptions.aurBin}`;
                    break;
                case "flatpak":
                    launchCode = `yes | flatpak run ${emu.installOptions.flatpak}`;
                    await $`distrobox-host-exec flatpak install -u ${emu.installOptions.flatpak}`;
                    if (emu.installOptions.flatpakOverrideFs === true) 
                        await $`distrobox-host-exec flatpak override -u ${emu.installOptions.flatpak} --filesystem home --filesystem /run/media`;
                    break;
                case "github":
                    // launchCode = `$HOME/.emuboxs/apps/`
                    await $`curl https://api.github.com/repos/${emu.installOptions.github}/releases`;
                    const latestRelease = (await (await fetch(`https://api.github.com/repos/${emu.installOptions.github}/releases`)).json())[0];
                    const targetAsset = latestRelease.assets.find(d => d.name.match(emu.installOptions.githubRe!));
                    /*if (!targetAsset) {
                        await
                    }*/
                    
                    break;
                case "libretro":
                   // todo: download core from buildbot, disallow method if retroarch isn't installed.
            }

            write(
                file(join(homedir(), ".emubox", "launchers", `${emu.short}.sh`)),
                `#!/bin/bash\n${launchCode} "$@"`
            );
            await $`chmod +x $HOME/.emubox/launchers/${emu.short}.sh`;
            
            if (!config.installed.find(d => d.short === emu.short)) {
                config.installed.push({
                    short: emu.short,
                    source: i.source
                });
            }
            
            successes++;
        } catch (e) {
            console.log(chalk.red(`Failed to install ${emu.name}: ${e.message}`));
        }
    }

    write(
        file(join(homedir(), ".emubox", "config.json")),
        JSON.stringify(config)
    );

    if (successes === 0)
        console.log(chalk.red("All items failed to install."));
    else if (successes < response.length) 
        console.log(chalk.yellow("Some items installed successfully."));
    else
        console.log(chalk.green("All items installed successfully."));
}

_install();