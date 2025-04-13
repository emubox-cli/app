type SupportedConsoles =
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
    short: string;
    consoles: SupportedConsoles[];
    makeLauncher?: boolean;
    overrideAvailible?: boolean;
    installOptions: {
        flatpak?: string;
        flatpakOverrideFs?: boolean;
        aur?: string;
        aurBin?: string;
        // because retroarch had to be different and i'm not retyping all this rn
        aurBinAlt?: string;
        customGit?: string;
        gitRepo?: string;
        gitRe?: RegExp;
        unzipTarget?: string;
        libretroCore?: string;

    };
}

const apps: BoxApp[] = [
    {
        name: "Retroarch",
        short: "retroarch",
        consoles: ["#util"],
        installOptions: {
            flatpak: "org.libretro.RetroArch",
            aur: "retroarch-git",
            aurBin: "RetroArch",
            aurBinAlt: "retroarch"
        }
    },
    {
        name: "Steam ROM Manager",
        short: "srm",
        consoles: ["#util"],
        makeLauncher: false,
        installOptions: {
            aur: "steam-rom-manager-git",
            aurBin: "steam-rom-manager"
        }
    },
    {
        name: "PPSSPP",
        short: "ppsspp",
        consoles: ["psp"],
        installOptions: {
            flatpak: "org.ppsspp.PPSSPP",
            aur: "ppsspp-git",
            aurBin: "PPSSPPSDL",
            libretroCore: "ppsspp",
            gitRepo: "pkgforge-dev/PPSSPP-AppImage",
            gitRe: /ppsspp-.*-anylinux-x86_64\.AppImage/
        }
    },
    {
        name: "DuckStation",
        short: "duckstation",
        consoles: ["psx"],
        installOptions: {
            flatpak: "org.duckstation.DuckStation",
            aur: "duckstation-git",
            aurBin: "duckstation",
            gitRepo: "stenzek/duckstation",
            gitRe: /DuckStation-x64\.AppImage/
        }
    },
    {
        name: "Beetle PSX",
        short: "beetle-psx",
        consoles: ["psx"],
        installOptions: {
            libretroCore: "mednafen_psx"
        }
    },
    {
        name: "PCSX ReARMed",
        short: "pcsx-rearmed",
        consoles: ["psx"],
        installOptions: {
            libretroCore: "pcsx_rearmed"
        }
    },
    {
        name: "PCSX2",
        short: "pcsx2",
        consoles: ["ps2"],
        installOptions: {
            flatpak: "net.pcsx2.PCSX2",
            aur: "pcsx2-git",
            aurBin: "PCSX2",
            gitRepo: "pcsx2/pcsx2",
            gitRe: /pcsx2-v.*-linux-appimage-x64-Qt\.AppImage/,
            libretroCore: "pcsx2"
        }
    },
    {
        name: "RPCS3",
        short: "rpcs3",
        consoles: ["ps3"],
        installOptions: {
            flatpak: "net.rpcs3.RPCS3",
            aur: "rpcs3-git",
            aurBin: "rpcs3",
            gitRepo: "RPCS3/rpcs3-binaries-linux",
            gitRe: /rpcs3-v.*-.*-.*_linux64.AppImage/
        }
    }, 
    {
        name: "Snes9x",
        short: "snes9x",
        consoles: ["snes"],
        installOptions: {
            flatpak: "com.snes9x.Snes9x",
            flatpakOverrideFs: true,
            aur: "snes9x-gtk-git",
            aurBin: "snes9x-gtk",
            libretroCore: "snes9x",
            gitRepo: "snes9xgit/snes9x",
            gitRe: /Snes9x-*.-x86_64\.AppImage/
        }
    },
    {
        name: "mGBA",
        short: "mgba",
        consoles: ["gba"],
        installOptions: {
            flatpak: "io.mgba.mGBA",
            aur: "mgba-qt-git",
            aurBin: "mgba-qt",
            gitRepo: "mgba-emu/mgba",
            gitRe: /mGBA-.*-appimage-x64\.appimage/,
            libretroCore: "mgba"
        }
    },
    {
        name: "Rosalie's Mupen GUI",
        short: "rmg",
        consoles: ["n64"],
        installOptions: {
            flatpak: "com.github.Rosalie241.RMG",
            aur: "rmg-git",
            aurBin: "RMG",
            gitRepo: "rosalie241/rmg",
            gitRe: /RMG-Portable-Linux64-v.*\.AppImage/
        }
    },
    {
        name: "Mupen64+ Next",
        short: "m64p-next",
        consoles: ["n64"],
        installOptions: {
            libretroCore: "mupen64plus_next"
        }
    },
    {
        name: "MelonDS",
        short: "melonds",
        consoles: ["nds"],
        installOptions: {
            flatpak: "net.kuribo64.melonDS",
            aur: "melonds-git",
            aurBin: "melonDS",
            gitRepo: "melonds-emu/melonds",
            gitRe: /melonDS-appimage-x86_64.zip/,
            unzipTarget: "melonDS-x86_64.AppImage",
            libretroCore: "melonds"
        }
    },
    {
        name: "Dolphin Emulator",
        short: "dolphin-emu",
        consoles: ["gc", "wii"],
        installOptions: {
            flatpak: "org.DolphinEmu.dolphin-emu",
            aur: "dolphin-emu-git",
            aurBin: "dolphin-emu",
            libretroCore: "dolphin",
            gitRepo: "pkgforge-dev/Dolphin-emu-AppImage",
            gitRe: /Dolphin_Emulator-.*-.*-anylinux.squashfs-x86_64.AppImage/
        }
    },
    {
        name: "Cemu",
        short: "cemu",
        consoles: ["wiiu"],
        installOptions: {
            aur: "cemu-git",
            aurBin: "Cemu",
            gitRepo: "cemu-project/Cemu",
            gitRe: /Cemu-.*-x86_64.AppImage/
        }
    },
    {
        name: "Torzu",
        short: "torzu",
        consoles: ["switch"],
        installOptions: {
            aur: "torzu-git",
            aurBin: "yuzu"
        }
    },
    {
        name: "Ryujinx",
        short: "ryujinx",
        consoles: ["switch"],
        installOptions: {
            aur: "ryujinx-git",
            aurBin: "ryujinx",
            gitRepo: "Ryubing/Stable-Releases",
            gitRe: /ryujinx-.*-x64\.AppImage/
        }
    },
    {
        name: "Citron",
        short: "citron",
        consoles: ["switch"],
        installOptions: {
            aur: "citron-bin",
            aurBin: "citron",
            gitRepo: "pkgforge-dev/Citron-AppImage",
            gitRe: /Citron-v.*-anylinux-x86_64_v3\.AppImage/
        }
    },
    {
        name: "Azahar",
        short: "azahar",
        consoles: ["3ds"],
        installOptions: {
            aur: "azahar-git",
            aurBin: "azahar"
        }
    }
];

export function getAppFromShort(short: string) {
    return apps.filter(d => d.installOptions.aur).find(d => d.short === short);
}

export default apps;
