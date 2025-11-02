/* eslint-disable @typescript-eslint/no-explicit-any */
 
export async function getLatestRelease(repo: string) {
    const releases = await getReleases(repo);

    // @ts-expect-error typical js amirite
    return releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];
}

export async function getTaggedRelease(repo: string, tag: string) {
    const releases = await getReleases(repo);

    return releases.find(r => r.tag_name === tag);
}


async function getReleases(repo: string): Promise<{ [x: string]: any }[]> {
    
    return await (await fetch(`https://api.github.com/repos/${repo}/releases`)).json() as any;
}