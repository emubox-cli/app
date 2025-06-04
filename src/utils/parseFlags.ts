type Flags = { [x: string]: string | string[] };
export default function(args: string[], flags: Flags): { 
    flags: { [key in keyof typeof flags]: boolean };
    args: string[];
} {
    const preparedFlags: { [x: string]: boolean } = {};
    for (const flag of Object.keys(flags)) {
        const targets = typeof flags[flag] === "string" ? [flags[flag]] : flags[flag];

        for (const check of targets) {
            const argI = args.indexOf(check);
            if (argI !== -1) {
                preparedFlags[flag] = true;
                args.splice(argI, 1);
                continue;
            }
            
            if (preparedFlags[flag] === undefined) 
                preparedFlags[flag] = false;
        }
    }
    return {
        flags: preparedFlags,
        args
    };
}