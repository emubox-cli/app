import { homedir } from "os";
import { SupportedConsoles } from "utils/apps";
import { generateManifest } from "utils/manifests";

const HELP_MSG = 
`
emubox gen-manifest: emubox gen-manifest <EMULATOR_ID>
    Create SRM manual manifest file at "${homedir()}/.emubox/manifests".
`;
export default async function(dirId: string) {
    if (!dirId) {
        console.log(HELP_MSG);
        return;
    }

    await generateManifest(dirId as SupportedConsoles);
    console.log("Done!");
}