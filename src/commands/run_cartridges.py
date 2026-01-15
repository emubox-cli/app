from . import sync
from os import popen
from utils.constants import CONTAINER_PREFIX

skip_precheck = False

async def exec(*args, **kwargs):
    await sync.exec(**kwargs)

    popen(f"{CONTAINER_PREFIX} cartridges")