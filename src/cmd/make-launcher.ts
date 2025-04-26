import { openConfig, writeConfig } from "utils/config";

export default async function(app: string, exec: string) {
    if (!app || !exec) {
        console.log("HELP_MSG");
        return;
    }
    const config = await openConfig();
    config.customLaunchers[app] = exec;
    writeConfig(config);

    console.log(`Custom launcher created! Run it with 'emubox run ${app}'`);
}