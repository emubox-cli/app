import aiohttp, aiofiles
from os import chmod
import stat

# not tryna type aiohttp.ClientSession everywhere
async def request(url: str):
    async with aiohttp.ClientSession() as sess:
        async with sess.get(url) as req:
            return await req.json()

async def get_releases(repo: str):
    return await request(f"https://api.github.com/repos/{repo}/releases")

async def download_file(url: str, path: str):
    async with aiohttp.ClientSession() as sess:
        async with sess.get(url) as req:
            if req.status == 200:
                async with aiofiles.open(path, mode="wb") as f:
                    await f.write(await req.read())
                    

