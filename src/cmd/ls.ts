import parseFlags from "utils/parseFlags";
import apps from "../utils/apps";
import { openConfig } from "utils/config";

export default async function(...args: string[]) {
    const { flags: { installed: isInstalled } } = parseFlags(args, {
        "installed": ["-i", "--installed"],
    });

    
    const config = await openConfig();
    const installedApps = config.installed.map(d => d.id);
    console.log(
        apps.a.filter(
            d => {
                if (isInstalled) 
                    return installedApps.includes(d.i);
                return true;
            }
        )
        .sort((a, b) => (installedApps.includes(a.i) === installedApps.includes(b.i)) ? 0 : installedApps.includes(a.i) ? 1 : -1)
        .map(d => { 
            let installationStatement = "";
            if (installedApps.includes(d.i)) 
                installationStatement = `Installed with: ${config.installed.find(dd => d.i == dd.id)?.source}`;
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

                installationStatement = `(${installOpts.join(", ")})`;
            }
            const line = `- ${d.i}: ${d.n}`;
            return `${line}${" ".repeat(50 - line.length)}| ${installationStatement}`; 
        })
        .join("\n")
    );
}
