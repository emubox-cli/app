import { $ } from "bun";
import containerPrefix from "./containerPrefix";

export default async function() {
    console.log("Terminating steam...");
    const flatpakPs = await $`${containerPrefix}flatpak ps`.quiet();
    const pidOfSteam = await $`pidof steam`.quiet().nothrow();
    if (flatpakPs.text().includes("com.valvesoftware.Steam")) {
        await $`${containerPrefix}flatpak kill com.valvesoftware.Steam`;
    }

    if (pidOfSteam.exitCode !== 1) {
        await $`killall steam`;
    }
}