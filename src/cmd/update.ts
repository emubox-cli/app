import { $ } from "bun";
import { ppid } from "process";
import containerPrefix from "utils/containerPrefix";

export default async function() {
    const parentCmd = await $`cat /proc/${ppid}/comm`.text();
    if (parentCmd !== "emubox-update") {
        console.log("Please run 'emubox-update', apologies for the inconvience.");
        return;
    }
    await $`${containerPrefix}paru -Syu --noconfirm`.nothrow();
    // await $`${containerPrefix}flatpak -U`
    // todo: update appimages
    
}
