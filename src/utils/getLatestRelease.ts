export default async function(repo: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const releases: { [x: string]: any }[] = await (await fetch(`https://api.github.com/repos/${repo}/releases`)).json() as any;
    let latest = releases[0];
    if (latest.prerelease) 
        latest = releases[1];
    
    return latest;
}