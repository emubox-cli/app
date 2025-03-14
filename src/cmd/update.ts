import { $ } from "bun";
import containerPrefix from "utils/containerPrefix";

export default async function() {
    await $`${containerPrefix} paru -Syu`;
    const latest = (await $`curl https://emubox.wolves-are.gay/latest`.text()).replace("\n", "");

    // @ts-expect-error defined in build
    if (_SHA !== latest) {
        console.log("Updating emubox...");
        await $`curl https://emubox.wolves-are.gay/emubox > $HOME/.local/bin/emubox`;
    } else 
        console.log("Emubox is up to date");
    
}
