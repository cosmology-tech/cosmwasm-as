# CosmWasm in AssemblyScript

**NOTE: This is purely for study and experimentation. Confio has expressed doubt regarding AssemblyScript's viability as a serious CosmWasm language due to concerns about security.**

This repository contains a sample implementation of several CosmWasm smart contracts written in AssemblyScript. We test the behavior of our contracts against [`cosmwasm-vm-js`](https://github.com/terran-one/cosmwasm-vm-js), a JavaScript-based runtime for CosmWasm that is convenient to instrument and run locally.

## Background

[CosmWasm](https://cosmwasm.com) is a smart contract framework developed and maintained by [Confio](https://confio.io), designed to enable WebAssembly (Wasm) smart contracts on [Cosmos SDK](https://v1.cosmos.network/sdk)-based blockchains such as Terra, Juno, Osmosis, Injective (to name a few).



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


