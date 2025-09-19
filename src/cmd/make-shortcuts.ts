import { $ } from "bun";
import input from "@inquirer/input";
import makeDesktopFile from "utils/makeDesktopFile";
import { join } from "path";
import { homedir } from "os";
import apps from "utils/apps";
import { openConfig } from "utils/config";
import parseFlags from "utils/parseFlags";
import containerPrefix from "utils/containerPrefix";

export default async function(...args: string[]) {
    const config = await openConfig();
    if (config.sgdbToken === "") {
        console.log("This command requires a SteamGridDB api token to run.");
        console.log("Use 'emubox config set sgdbToken <my-token>' to set your token and try again.");
        return;
    }

    const {
        flags: { steam },
        args: _args
    } = parseFlags(args, {
        steam: ["-s", "--steam"]
    });

    if (!_args.length) {
        console.log("No path provided.");
        return;
    }

    const path = join(homedir(), ".emubox", "roms", _args[0]);
    const splitThingy = path.split("/");
    const romDir = splitThingy[splitThingy.length - 2];
    let romName = splitThingy[splitThingy.length - 1]!.split(".").shift();
        
    let nameValid = false;
    let successful = true;

    console.log(`Searching first name: ${romName}`);
    let games = await $`curl -H "Authorization: Bearer ${config.sgdbToken}" https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(romName!)}`.json();

    while (!nameValid) {
        if (!games.success) {
            console.log("SteamGridDB search failed:", games.errors);
            successful = false;
            break;
        } else if (!games.data) {
            console.log("No results found...");
            romName = await input({
                message: "Enter the name of your game: "
            });

            games = await $`curl -H "Authorization: Bearer ${config.sgdbToken}" https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(romName!)}`.json();
        } else 
            nameValid = true;
    }

    if (!successful)
        return;

    const game = games.data[0];
    const eligibleApps = apps.a.filter(d => d.c.includes(romDir) && config.installed.some(dd => dd.id === d.i));
    const icons = await $`curl -H "Authorization: Bearer ${config.sgdbToken}" https://www.steamgriddb.com/api/v2/icons/game/${game.id}`.json();
    const targetIcon = icons.data[0].url;
    let exec = "";

    
    if (!eligibleApps.length) {
        console.log("No apps installed to run this game.");
        return;
    } else if (eligibleApps.length === 1) {
        console.log(`Using ${eligibleApps[0].n} as runner...`);
        exec = eligibleApps[0].e;
    }

    await $`curl -o $HOME/.local/share/icons/emubox/games/${game.id}.png ${targetIcon}`;
    if (steam) {
        console.log("Checking for steamtinkerlaunch...");
        try {
            await $`${containerPrefix}steamtinkerlaunch --help`.quiet();
        } catch {
            await $`${containerPrefix}paru -S --noconfirm steamtinkerlaunch`;
        }

        console.log("Adding game to steam...");
        await $`
            ${containerPrefix}steamtinkerlaunch ansg \
                -an="${game.name}" \
                -ep="~/.local/bin/emubox" \
                -lo="run ${eligibleApps[0].i + " " + exec.replace("{}", `"${path}"`)}" \
                -ip="$HOME/.local/share/icons/emubox/games/${game.id}.png"
        `;
    } else {
        
        makeDesktopFile(
            game.id,
            {
                name: game.name,
                exec: eligibleApps[0].i + " " + exec.replace("{}", `"${path}"`),
                icon: join(homedir(), ".local", "share", "icons", "emubox", "games", game.id + ".png")
            }
        );
    }


    
}
