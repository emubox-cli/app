import { SupportedConsoles } from "utils/apps";
import { generateManifest } from "utils/manifests";

export default async function(dirId: string) {
    if (!dirId) {
        console.log("HELP_MSG_HERE");
        return;
    }

    await generateManifest(dirId as SupportedConsoles);
    console.log("Done!");
}