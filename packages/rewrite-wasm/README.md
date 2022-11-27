# `@cosmwasm-as/rewrite-wasm`

A tool for rewriting `.wasm` binaries outputted by the AssemblyScript compiler to be compatible with CosmWasm.

## Features

- replaces `(start ...)` operation and inserts it before every exported function

## Installation

Install globally:

```bash
npm install -g @cosmwasm-as/rewrite-wasm
```

## Usage

```bash
cosmwasm-as-rewrite-wasm [--optimize=1] <.wasm file>
```

- The `optimize=1` flag is used for release versions and uses Binaryen to optimize the result binary.
- Binaries are rewritten **IN PLACE**.
