export type SupportedConsoles =
    "#util" |
    "snes" |
    "gba" |
    "n64" |
    "nds" |
    "gc" |
    "wii" |
    "nds" |
    "wiiu" |
    "3ds" |
    "switch" |
    "psp" |
    "psx" |
    "ps2" |
    "ps3";

export const SUPPORTED_CONSOLES: SupportedConsoles[] = [
    "snes",
    "gba",
    "n64",
    "nds",
    "gc",
    "wii",
    "wiiu",
    "3ds",
    "switch",
    "psp",
    "psx",
    "ps2",
    "ps3"
];

export interface BoxApp {
    name: string;
    id: string;
    consoles: SupportedConsoles[];
    makeLauncher?: boolean;
    overrideAvailible?: boolean;
    installOptions: {
        flatpak?: string;
        flatpakOverrideFs?: boolean;
        aur?: string;
        aurBin?: string;
        // for retroarch...
        aurExportTitle?: string;
        customGit?: string;
        gitRepo?: string;
        gitRe?: string;
        unzipSubdir?: string;
        unzipTarget?: string;
        libretroCore?: string;
    };
}

// @ts-expect-error "Erm actually string[] doesn't support SupportedConsole[]" 🤓
const apps: BoxApp[] = (await import("./apps.json")).default;

export function getAppFromId(id: string) {
    return apps.find(d => d.id === id);
}

export default apps;
