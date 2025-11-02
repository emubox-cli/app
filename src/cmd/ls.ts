import parseFlags from "utils/parseFlags";
import apps from "utils/apps";
import { openConfig } from "utils/config";
import { bold, green, red } from "yoctocolors";

export default async function(...args: string[]) {
    const { flags: { installed: isInstalled } } = parseFlags(args, {
        "installed": ["-i", "--installed"],
    });

    const config = await openConfig();
    const installedApps = config.installed.map(d => d.id);
    const listables = apps.a.filter(
        d => {
            if (isInstalled) 
                return installedApps.includes(d.i);
            return true;
        }
    );

    
    const longestIdLength = listables.sort((a, b) => b.i.length - a.i.length)[0].i.length + 1;
    const longestNameLength = listables.sort((a, b) => b.n.length - a.n.length)[0].n.length + 1;
    const longestConsoleLength = listables.sort((a, b) => b.c.join(", ").length - a.c.join(", ").length)[0].c.join(", ").length + 1;
    const longestStatusLength = 14;

    const displayLines = listables
        .sort((a, b) => (installedApps.includes(a.i) === installedApps.includes(b.i)) ? 0 : installedApps.includes(a.i) ? -1 : 1)
        .map(d => { 
            /*let installationStatement = "";
            if (installedApps.includes(d.i)) 
                installationStatement = green(`Installed with ${config.installed.find(dd => d.i == dd.id)?.source}`);
            else {
                const installOpts = [];
                if (d.o.includes("a"))
                    installOpts.push("AUR");
                if (d.o.includes("f"))
                    installOpts.push("FLATPAK");
                if (d.o.includes("g"))
                    installOpts.push("APPIMAGE");
                if (d.o.includes("m"))
                    installOpts.push("MANUAL_PROVIDE_REQUIRED");

                installationStatement = red(`Not installed (options: ${installOpts.join(", ")})`);
            }*/

            const isInstalled = installedApps.includes(d.i);
            const consoleLine = d.c.join(", ");
            const installedLine = (!isInstalled ? "NOT " : "") + "INSTALLED";

            return (d.i + 
            " ".repeat(longestIdLength - d.i.length) + 
            "| " + 
            d.n +
            " ".repeat(longestNameLength - d.n.length) +
            "| " +
            consoleLine +
            " ".repeat(longestConsoleLength - consoleLine.length) +
            "| " +
            (isInstalled ? green : red)(bold(installedLine)) +
            " ".repeat(longestStatusLength - installedLine.length) +
            "| " +
            (installedApps.includes(d.i) ? config.installed.find(dd => d.i == dd.id)?.source.replace("github", "appimage") : "-"));
        });
    
    // console.log(displayLines[0].indexOf("|", 0));

    console.log(
        // TODO: not hardcode this
        /*bold("ID") +
        " ".repeat(displayLines[0].indexOf("|", 0) - 2) +
        "| " +
        bold("NAME") +
        " ".repeat(displayLines[0].indexOf("|", 1) + 1) +
        "| " +
        bold("CONSOLE") +
        " ".repeat(displayLines[0].indexOf("|", 2) - 14) +
        "| " + 
        bold("INSTALLED") +
        " ".repeat(displayLines[0].indexOf("|", 3) - 14) +
        "| " +
        bold("METHOD") +
        "\n" +*/
        displayLines
            .join("\n")
    );
}