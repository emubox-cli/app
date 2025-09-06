export default function(data: { [x: string]: { [x: string]: string } }, savePath: string, id: string) {
    let final = "";
    for (const key of Object.keys(data)) {
        final += `[${key}]\n`;
        for (const kkey of Object.keys(data[key])) {
            final += `${kkey}=${data[key][kkey].replaceAll("<save>", savePath).replaceAll("<id>", id)}\n`;
        }
    }

    return final;
}