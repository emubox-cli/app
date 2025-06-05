build ext="":
   bun build ./src/main.ts \
    --sourcemap \
    --target=bun-linux-x64 \
    --compile \
    --minify \
    --outfile dist/emubox \
    --define="_SHA='debug-$(just _make-build-date)'" \
    {{ext}}

_make-build-date:
    #!/usr/bin/env bun
    const rn = new Date();
    console.log(String(rn.getFullYear()) + rn.getMonth() + rn.getDate() + rn.getHours() + rn.getMinutes() + rn.getSeconds());


debug args="":
    ./dist/emubox {{args}}
    