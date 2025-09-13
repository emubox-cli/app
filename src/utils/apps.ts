import { $, file } from "bun";
import { dir } from "./config";

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

export interface MinifiedApps {
    /**
     * App List Version
     */
    v: string;
    /**
     * Minified list of apps
     */
    a: {
        /**
         * App name
         */
        n: string;
        /**
         * App id
         */
        i: string;
        /**
         * App consoles
         */
        c: string[];
        /**
         * App install options
         */
        o: string[];
        /**
         * App game exec
         */
        e: string;
    }[];

}
export interface BoxApp {
    extends?: string;
    name: string;
    consoles: SupportedConsoles[];
    makeLauncher?: boolean;
    srmParsers?: string[];
    postInstall: {
        _basedOn?: string;
        makeDirs: string[];
        makeFiles: {
            path: string;
            content: { [x: string]: { [x: string]: string } };
        }[]; 
    };
    installOptions: {
        manual?: boolean;
        flatpak?: string;
        flatpakOverrideFs?: boolean;
        aur?: string;
        aurExportName?: string;
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



export const REQUEST_DOMAIN = "https://emubox-cli.github.io/apps/";
let apps: MinifiedApps;

const appFile = file(dir("apps.json"));

// hacky but prevents the binary from breaking on debug
if (!await appFile.exists()) 
    apps = { v: "", a: [] };
else 
    apps = await appFile.json() as never;

export async function getAppFromId(id: string): Promise<BoxApp> {
    try {
        return JSON.parse(await $`curl ${REQUEST_DOMAIN}${id}.json`.text());
    } catch {
        return undefined as unknown as BoxApp;
    }
}

export default apps;
