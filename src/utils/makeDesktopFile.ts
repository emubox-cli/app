export default ({
    name,
    exec,
    icon
}: { [x: string]: string }) => 
`
[Desktop Entry]
Type=Application
Name=${name}
Exec=/usr/bin/distrobox enter emubox -- ${exec}
Icon=${icon}
Categories=Game;Emulator;
`
