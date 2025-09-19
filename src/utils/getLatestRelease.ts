export default async function(repo: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const releases: { [x: string]: any }[] = await (await fetch(`https://api.github.com/repos/${repo}/releases`)).json() as any;

    // @ts-expect-error typical js amirite
    return releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];
}