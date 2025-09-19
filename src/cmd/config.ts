import { openConfig, writeConfig } from "utils/config";
import { blue } from "yoctocolors";

export default async function(...args: string[]) {
    const KEYS_IN_FOCUS = [
        "romDir",
        "saveDir",
        "sgdbToken"
    ];

    const config = await openConfig();

    if (args[0]) switch (args[0]) {
        case "set":
            if (!args[1]) 
                return;
            if (config[args[1]] === undefined || !args[2]) {
                console.log(args[1]);
                return;
            }

            console.log("success!");
            config[args[1]] = args[2];
            writeConfig(config);

            return;
    }

    
    for (const i of KEYS_IN_FOCUS) {
        console.log(blue(i), " ", config[i]);
    }
}