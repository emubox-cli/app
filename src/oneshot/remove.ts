import remove from "../funcs/remove";

export default async function(...toRemove: string[]) {
    for (const i of toRemove) {
        remove(i);
    }
}