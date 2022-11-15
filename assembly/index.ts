// This file is important for the AssemblyScript compiler to correctly construct
// the WASM module, and should be common to all CosmWasm AssemblyScript projects.
// To program your contract, you should modify code in the `./contract` folder.

export {
	instantiate,
	execute,
	query,
	allocate,
	deallocate,
	interface_version_8
} from './cosmwasm/exports';
