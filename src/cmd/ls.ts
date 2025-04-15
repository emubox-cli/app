import apps from "../utils/apps";

export default function() {
    console.log(apps.filter(d => d.installOptions.aur).map(d => `- ${d.name} (id: ${d.id})`).join("\n"));
}
