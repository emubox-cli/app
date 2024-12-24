import { $ } from "bun";
import containerPrefix from "utils/containerPrefix";

export default async function() {
    await $`${containerPrefix} paru -Syu`;
}