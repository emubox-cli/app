# 🎮 Emubox
A package manager for emulators, in a distrobox container.

I like the ideas utilized by the [Emudeck](https://github.com/dragoonDorise/EmuDeck) project, but think their scope reaches a little too far for my preferences. Emubox is a CLI alternative with a faster install time, and less overhead.

### Features
- Contained mostly* one directory (~/.emubox) *aside from flatpaks
- Custom ROM and Saves directory choices
- Emulator installation and updates from AUR, Flathub, and Github (as AppImages)
- Desktop/Steam shortcuts for ROMs.


### Installation
Requires distrobox
```
sh -c "$(curl -sSL https://emubox.pupper.space/install)"
```

