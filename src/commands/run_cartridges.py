from . import sync
from os import system
from utils.constants import CONTAINER_PREFIX

skip_precheck = False

async def exec(*args, **kwargs):
    await sync.exec(**kwargs)

    system(f"{CONTAINER_PREFIX} cartridges")