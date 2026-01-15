init:
    python3 -m venv ./.venv
    ./.venv/bin/pip install readline pip-system-certs pyinstaller aiohttp aiofiles pillow

create-debug-box:
    distrobox assemble create --file emubox.ini -n emubox
    distrobox stop -Y emubox
    distrobox assemble create --file emubox.ini -n emubox-debug

@build debug="1" sha="DEBUG":
    cp src/env-hook.py /tmp/emubox-env.py
    printf 'env["EMUBOX_DEBUG"]="{{debug}}"\nenv["EMUBOX_SHA"]="{{sha}}"\n' >> /tmp/emubox-env.py
    .venv/bin/pyinstaller --onefile --hidden-import readline --hidden-import pip-system-certs --runtime-tmpdir /tmp -n emubox --runtime-hook /tmp/emubox-env.py src/main.py
    rm /tmp/emubox-env.py


@run +args="":
    ./dist/emubox {{ args }}

@debug +args="":
    just build
    just run {{ args }}