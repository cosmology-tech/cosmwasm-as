// This file is important for the AssemblyScript compiler to correctly construct
// the WASM module, and should be common to all CosmWasm AssemblyScript projects.
// To program your contract, you should modify code in the `./contract` folder.

// Required Wasm exports
import {do_instantiate, do_execute, do_query} from "@cosmwasm-as/std";
import {ExecuteMsg, InstantiateMsg, QueryMsg} from "./src/msg";
import {instantiateFn, executeFn, queryFn} from "./src/contract";

export {
	interface_version_8,
	allocate,
	deallocate,
} from '@cosmwasm-as/std';

export function instantiate(env: i32, info: i32, msg: i32): i32 {
	return do_instantiate<InstantiateMsg>(env, info, msg, instantiateFn);
}

export function execute(env: i32, info: i32, msg: i32): i32 {
	return do_execute<ExecuteMsg>(env, info, msg, executeFn);
}

export function query(env: i32, msg: i32): i32 {
	return do_query<QueryMsg>(env, msg, queryFn);
}
