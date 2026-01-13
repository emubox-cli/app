init:
    python3 -m venv ./.venv
    ./.venv/bin/pip install pyinstaller aiohttp aiofiles pillow

create-debug-box:
    distrobox assemble create --file emubox.ini -n emubox
    distrobox stop -Y emubox
    distrobox assemble create --file emubox.ini -n emubox-debug

@build debug="1" sha="DEBUG":
    cp src/env-hook.py /tmp/emubox-env.py
    echo -e '\nenv["EMUBOX_DEBUG"]="{{debug}}"\nenv["EMUBOX_SHA"]="{{sha}}"' >> /tmp/emubox-env.py
    cat /tmp/emubox-env.py
    .venv/bin/pyinstaller --onefile --runtime-tmpdir /tmp -n emubox --runtime-hook /tmp/emubox-env.py src/main.py
    rm /tmp/emubox-env.py


@run +args="":
    ./dist/emubox {{ args }}

@debug +args="":
    just build
    just run {{ args }}