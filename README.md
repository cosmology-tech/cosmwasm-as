# CosmWasm in AssemblyScript

<div align="center">

![image](./banner.png)

</div>

<!-- TOC -->
* [CosmWasm in AssemblyScript](#cosmwasm-in-assemblyscript)
	* [Background](#background)
	* [Quickstart](#quickstart)
<!-- TOC -->

**NOTE: This is purely for study and experimentation. Confio has expressed doubt regarding AssemblyScript's viability as a serious CosmWasm language due to concerns about security.**

This repository contains a sample implementation of several CosmWasm smart contracts written in AssemblyScript. We test the behavior of our contracts against [`cosmwasm-vm-js`](https://github.com/terran-one/cosmwasm-vm-js), a JavaScript-based runtime for CosmWasm that is convenient to instrument and run locally.


## Quickstart

1. First, clone the repository.

```bash
$ git clone https://github.com/terran-one/cosmwasm-as
```

2. Install the dependencies. We used `yarn`, but you can use `npm` as well.
```bash
$ yarn
```

3. Run `asbuild` to build the AssemblyScript Wasm binaries.

```bash
$ yarn asbuild
```

4. Run the tests.

```bash
$ yarn test
```


## Background

[CosmWasm](https://cosmwasm.com) is a smart contract framework developed and maintained by [Confio](https://confio.io), designed to enable smart contracts on [Cosmos SDK](https://v1.cosmos.network/sdk)-based blockchains such as Terra, Juno, Osmosis, Injective (to name a few).
CosmWasm smart contracts are powered by [WebAssembly](https://webassembly.org/) ("Wasm"), a modern binary format and web standard focused on safety, portability and performance.

One exciting benefit of adopting CosmWasm is the promise of broad programming language support.
WebAssembly is quickly gaining traction as **the web's preferred standard** for the future of safe portable execution, and a number of languages have already or are starting to add support for Wasm as a compilation target.

### Current state of polyglot CosmWasm

At the time of writing (Nov 2022), the only real option for writing CosmWasm smart contracts is Rust.
While there have been some experimental efforts from the Confio team and other contributors to create SDKs in other languages like [Golang](https://github.com/cosmwasm/cosmwasm-go) and [AssemblyScript](https://github.com/CosmWasm/cosmwasm/tree/assemblyscript/contracts/assemblyscript-poc)*,
these have mostly not been maintained due to a lack of community.

### What languages work best with CosmWasm?

Although many languages claim to support WebAssembly, there are only a few which actually make decent candidates for usage with CosmWasm.
First, there should be a distinction between languages that can *run in* Wasm, and those that can *compile to* Wasm.

In the former, it is the language's runtime which gets compiled to Wasm, and not programs that are written in the language.
Consider how Python currently supports Wasm -- essentially, an entire Python interpreter is created inside the Wasm VM,
and your Python code (`.py`) is read and executed by that process. As you can imagine, the extra layer of emulation adds significant overhead --
without even considering that a smart contract's execution gets replicated thousands of times of every full node.

For CosmWasm, we desire a language with the following properties:

- static & strongly-typed
- minimal runtime

## Project Structure

This project was created with the [`asbuild`](https://github.com/AssemblyScript/asbuild) tool and follows a directory organization similar to other AssemblyScript projects.

```text
cosmwasm-as
    ├── assembly/ -- AssemblyScript source root
    │   ├── cosmwasm/ -- CosmWasm APIs
    │   │   ├── cw-storage-plus.ts -- `cw-storage-plus` analog
    │   │   ├── exports.ts -- defines expected CosmWasm exported members
    │   │   ├── imports.ts -- defines expected CosmWasm imports supplied by VM
    │   │   ├── types.ts -- CosmWasm definitions
    │   ├── src/ -- Contract implementation
    │   │   ├── contract.ts -- `contract.rs` analog
    │   │   ├── msg.ts -- `msg.rs` analog
    │   │   └── state.ts -- `state.rs` analog
    │   └── index.ts -- directs compiler on assembling Wasm module -- `lib.rs` analog
    ├── build/
    │   ├── debug.wasm -- Wasm binary: with debug symbols
    │   └── release.wasm -- Wasm binary: production-optimized
    └── tests/
        └── works.test.js -- Simple acceptance test
```

## Architecture

A *CosmWasm contract* is a Wasm module that adheres to the following structure:

### Wasm Imports

```ruby
(module
  ...
  (import "env" "db_read" (func $_ (param i32) (result i32)))
  (import "env" "db_write" (func $_ (param i32 i32)))
  (import "env" "db_scan" (func $_ (param i32)))
  (import "env" "db_next" (func $_ (param i32)))
  (import "env" "addr_humanize" (func $_ (param i32)))
  (import "env" "addr_canonicalize" (func $_ (param i32)))
  (import "env" "secp256k1_verify" (func $_ (param i32)))
  (import "env" "secp256k1_recover_pubkey" (func $_ (param i32)))
  (import "env" "ed25519_verify" (func $_ (param i32)))
  (import "env" "ed25519_batch_verify" (func $_ (param i32)))
  (import "env" "debug" (func $_ (param i32)))
  (import "env" "query_chain" (func $_ (param i32)))
  (import "env" "abort" (func $_ (param i32)))
  ...
)
```

### Wasm Exports

(import )
@external("env", "db_read")
export declare function db_read(keyPtr: usize): usize;

@external("env", "db_write")
export declare function db_write(keyPtr: usize, valuePtr: usize): void;

@external("env", "db_remove")
export declare function db_remove(keyPtr: usize): void;
// export declare function db_scan(messagePtr: usize): void;
// export declare function db_next(messagePtr: usize): void;
// export declare function addr_humanize(sourcePtr: usize, destPtr: usize): usize;
// export declare function addr_canonicalize(sourcePtr: usize, destPtr: usize): usize;
// export declare function addr_validate(sourcePtr: usize): usize;
// export declare function secp256k1_verify(messagePtr: usize): void;
// export declare function secp256k1_recover_pubkey(messagePtr: usize): void;
// export declare function ed25519_verify(messagePtr: usize): void;
// export declare function ed25519_batch_verify(messagePtr: usize): void;
// export declare function debug(messagePtr: usize): void;
// export declare function query_chain(messagePtr: usize): void;
// export declare function abort(messagePtr: usize): void;

```


### Wasm Exports



## Prior Art

- sdf
- sdf

## Copyright

Copyright &copy; 2022 Terran One LLC

