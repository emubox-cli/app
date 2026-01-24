[working-directory: "src"]
build IS_DEBUG="1" SHA="DEBUG":
    mkdir -p ../dist
    go build -o emubox -ldflags "-X main.EMUBOX_VERSION=2.0"
    chmod +x emubox
    mv emubox ../dist 

@run +args="":
    ./dist/emubox {{ args }}

@debug +args="":
    just build
    just run {{ args }}

cp-to-local:
    cp ./dist/emubox ~/.local/bin/emubox
