import { $ } from "bun";
import chalk from "chalk";
import containerPrefix from "utils/containerPrefix";

export default async function() {
    await $`${containerPrefix} paru -Syu`;
    // todo: update appimages
    const latest = (await $`curl https://emubox.wolves-are.gay/latest`.text()).replace("\n", "");

    // @ts-expect-error defined in build
    if (_SHA !== latest) {
        console.log(chalk.bold("Update the emubox manager by running the following command:"));
        console.log('sh -c "$(curl -sSL https://emubox.wolves-are.gay/install)" -u');
    } else 
        console.log("Emubox is up to date");
    
}
