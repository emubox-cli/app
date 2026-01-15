from os import environ as env
skip_precheck = True

async def exec(*_args, **_kwargs):
    print(env["EMUBOX_VERSION"])
    print(env["EMUBOX_SHA"])