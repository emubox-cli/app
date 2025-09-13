import { openConfig } from "utils/config";
import { blue } from "yoctocolors";

export default async function(...args: string[]) {
    const KEYS_IN_FOCUS = [
        "romDir",
        "saveDir",
        "sdgbToken"
    ];

    const config = await openConfig();
    for (const i of KEYS_IN_FOCUS) {
        console.log(blue(i), " ", config[i]);
    }
}