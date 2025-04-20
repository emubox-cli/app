export default ({
    name,
    exec,
    icon
}: { [x: string]: string }) => 
`\
[Desktop Entry]
Type=Application
Name=${name}
Exec=${exec}
Icon=${icon}
Categories=Game;Emulator;
`;
