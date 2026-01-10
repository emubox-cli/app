init:
    python3 -m venv ./.venv
    ./.venv/bin/pip install pyinstaller aiohttp aiofiles pillow
    just create-debug-box

create-debug-box:
    distrobox assemble create --file emubox.ini

@build debug="1" sha="DEBUG":
    cp src/env-hook.py /tmp/emubox-env.py
    echo -e '\nenv["EMUBOX_DEBUG"]="{{debug}}";env["EMUBOX_SHA"]="{{sha}}"' >> /tmp/emubox-env.py
    .venv/bin/pyinstaller --onefile --runtime-tmpdir /tmp -n emubox-py --runtime-hook /tmp/emubox-env.py src/main.py
    rm /tmp/emubox-env.py


@run +args="":
    ./dist/emubox-py {{ args }}

@debug +args="":
    just build
    just run {{ args }}