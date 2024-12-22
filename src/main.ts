import oneshot from "./oneshot";

// const [ , , ...args ] = process.argv;

// if (args.length) 
oneshot();
/*else {
    const selection = await select({
        message: chalk.bgWhite.black.bold("🎮 Emubox [VERSION HERE]"),
        choices: [
            {
                name: "Update",
                value: "update"
            },
            {
                name: "Install",
                value: "install"
            },
            {
                name: "Uninstall",
                value: "uninstall"
            },
            {
                name: "Configure",
                value: "configure"
            },
            {
                name: "Exit",
                value: "exit",
            }
        ],
        theme: {
            prefix: ""
        }

    });

    console.clear();
    switch (selection) {
        case "update": import("./commands/update");
            break;
        case "install": import("./commands/install");
            break;
        case "uninstall": import("./commands/uninstall");
            break;
        case "exit": process.exit();
    }

}*/
