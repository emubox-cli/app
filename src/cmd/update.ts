import { $ } from "bun";
import containerPrefix from "utils/containerPrefix";

export default async function() {
    await $`
        ${containerPrefix} paru -Syu
        curl -o $HOME/.local/bin/emubox https://emubox.wolves-are.gay/emubox
    `;
}