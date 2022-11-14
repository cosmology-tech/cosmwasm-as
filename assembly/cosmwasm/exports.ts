import {JSON} from "json-as";
import { Result} from "as-container";

import {Binary, Response, Env, Info, Region} from "./types";

import { InstantiateMsg, ExecuteMsg, QueryMsg } from "../src/msg";
import { do_instantiate, do_execute, do_query } from "../src/contract";

@json
class ErrorRes {
	error: string;
}

function stringifyResult<T>(res: Result<T, string>): string {
	if (res.isOk) {
		return JSON.stringify<T>(res.unwrap());
	} else {
		return JSON.stringify<ErrorRes>({ error: res.unwrapErr() });
	}
}

export function instantiate(env: i32, info: i32, msg: i32): i32 {
	let rEnv = Region.fromPtr(env);
	let rInfo = Region.fromPtr(info);
	let rMsg = Region.fromPtr(msg);


	let envObj = JSON.parse<Env>(rEnv.readStr());
	let infoObj = JSON.parse<Info>(rInfo.readStr());
	let msgObj = JSON.parse<InstantiateMsg>(rMsg.readStr());

	let res = do_instantiate(envObj, infoObj, msgObj);
	return Region.allocateAndWriteStr(stringifyResult<Response>(res)).ptr;
}

export function execute(env: i32, info: i32, msg: i32): i32 {
	let rEnv = Region.fromPtr(env);
	let rInfo = Region.fromPtr(info);
	let rMsg = Region.fromPtr(msg);

	let envObj = JSON.parse<Env>(rEnv.readStr());
	let infoObj = JSON.parse<Info>(rInfo.readStr());
	let msgObj = JSON.parse<ExecuteMsg>(rMsg.readStr());

	let res = do_execute(envObj, infoObj, msgObj);
	return Region.allocateAndWriteStr(stringifyResult<Response>(res)).ptr;
}

export function query(env: i32, msg: i32): i32 {
	let rEnv = Region.fromPtr(env);
	let rMsg = Region.fromPtr(msg);

	let envObj = JSON.parse<Env>(rEnv.readStr());
	let msgObj = JSON.parse<QueryMsg>(rMsg.readStr());

	let res = do_query(envObj, msgObj);
	return Region.allocateAndWriteStr(stringifyResult<Binary>(res)).ptr;
}

export function allocate(size: usize): usize {
	let ptr = heap.alloc(size);
	let regionPtr = heap.alloc(12);

	store<u32>(regionPtr, ptr);
	store<u32>(regionPtr + 4, size);
	store<u32>(regionPtr + 8, size);

	return regionPtr;
}

export function deallocate(regionPtr: usize): void {
	let ptr = load<u32>(regionPtr);
	heap.free(ptr);
	heap.free(regionPtr);
}

