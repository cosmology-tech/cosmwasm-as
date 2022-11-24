import {JSON} from "json-as";
import {Result} from "as-container";

import {Binary, Response, Env, Info, Region} from "./types";
import {abort} from "./imports";

@json
class ErrorRes {
	error: string;
}

@json
class OkRes<T> {
	ok: T;
}

function stringifyResult<T>(res: Result<T, string>): string {
	if (res.isOk) {
		return JSON.stringify<OkRes<T>>({ok: res.unwrap()});
	} else {
		return JSON.stringify<ErrorRes>({error: res.unwrapErr()});
	}
}

type InstantiateFn<T> = (env: Env, info: Info, msg: T) => Result<Response, string>;
type ExecuteFn<T> = (env: Env, info: Info, msg: T) => Result<Response, string>;
type QueryFn<T> = (env: Env, msg: T) => Result<Binary, string>;

export function do_instantiate<T>(env: i32, info: i32, msg: i32, instantiateFn: InstantiateFn<T>): i32 {
	let rEnv = Region.fromPtr(env);
	let rInfo = Region.fromPtr(info);
	let rMsg = Region.fromPtr(msg);

	let envObj = JSON.parse<Env>(rEnv.readStr());
	let infoObj = JSON.parse<Info>(rInfo.readStr());
	let msgObj = JSON.parse<T>(rMsg.readStr());

	let res = instantiateFn(envObj, infoObj, msgObj);
	let resJson = stringifyResult(res);
	return Region.allocateAndWriteStr(resJson).ptr;
}

export function do_execute<T>(env: i32, info: i32, msg: i32, executeFn: ExecuteFn<T>): i32 {
	let rEnv = Region.fromPtr(env);
	let rInfo = Region.fromPtr(info);
	let rMsg = Region.fromPtr(msg);

	let envObj = JSON.parse<Env>(rEnv.readStr());
	let infoObj = JSON.parse<Info>(rInfo.readStr());
	let msgObj = JSON.parse<T>(rMsg.readStr());

	let res = executeFn(envObj, infoObj, msgObj);
	let resJson = stringifyResult(res);
	return Region.allocateAndWriteStr(resJson).ptr;
}

export function do_query<T>(env: i32, msg: i32, queryFn: QueryFn<T>): i32 {
	let rEnv = Region.fromPtr(env);
	let rMsg = Region.fromPtr(msg);

	let envObj = JSON.parse<Env>(rEnv.readStr());
	let msgObj = JSON.parse<T>(rMsg.readStr());

	let res = queryFn(envObj, msgObj);
	let resJson = stringifyResult(res);
	return Region.allocateAndWriteStr(resJson).ptr;
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

export function interface_version_8(): void {
}
