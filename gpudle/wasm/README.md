1: Set-up (one time)
- `cd` into this folder first
- Run `cargo install wasm-pack`
- Run `chmod +x build.sh`

2: How to compile
Run `./build.sh`

2: ALTERNATIVE | How to compile manually
`wasm-pack build --target web --release`
Then go inside the `pkg` folder and delete `.gitignore`

`wasm-pack` generates them and I can't find a way to disable that. The default
`.gitignore` generated stops the needed files from being tracked so we need that gone.

*yes that's what build.sh does lol*

The final binaries should be accessed by gpudle.js directly in the `pkg` compile target folder.