import { $ } from "bun";

export default async function() {
    await $`paru -Syu`;
}