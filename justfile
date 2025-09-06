set quiet

alias b := build


@build identifier="debug-$(just _make-build-date)":
    bun build ./src/main.ts \
        --sourcemap \
        --target=bun-linux-x64 \
        --compile \
        --minify \
        --outfile dist/emubox \
        --define="_SHA='{{identifier}}'"
    

_make-build-date:
    #!/usr/bin/env bun
    const rn = new Date();
    console.log(String(rn.getFullYear()) + rn.getMonth() + rn.getDate() + rn.getHours() + rn.getMinutes() + rn.getSeconds());

_clarify-dev-env:
    #!/bin/bash
    lol="$(./dist/emubox -v)"
    if [[ $lol == *"-debug-"*]]; then
        touch ./
    fi

lint: 
    bun x eslint

debug +args="":
    ./dist/emubox {{args}}

dev +args="": build
    just debug {{args}}
    