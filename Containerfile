FROM ghcr.io/ublue-os/arch-toolbox:latest

RUN paru -Syy --noconfirm \
    archlinux-keyring \
    zenity \
    cartridges \
    fuse2 \
    jack2 \
    glibmm \
    libxss \
    libxv \
    libxcomposite \
    harfbuzz \
    gdk-pixbuf2 \
    libxrandr \
    libxinerama \
    libxcursor \
    libxi \
    libxkbcommon \
    fribidi \
    fontconfig \
    libxdamage \
    libthai