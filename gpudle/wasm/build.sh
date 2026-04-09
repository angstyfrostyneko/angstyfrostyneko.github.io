#!/bin/sh

# Compile WASM
wasm-pack build --target web --release

# Delete garbage files
cd pkg
rm .gitignore

# There's no need to delete these as they're ignored and
# they're not pushed but I don't use them so out they go
rm wasm_bg.wasm.d.ts
rm wasm.d.ts
rm package.json
rm README.md
echo "[INFO]: Deleted extra files made by wasm-pack"