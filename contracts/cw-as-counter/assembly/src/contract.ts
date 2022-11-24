import {Binary, Response, Env, Info, to_binary} from "@cosmwasm-as/std";
import {Result} from "as-container";
import {InstantiateMsg, ExecuteMsg, QueryMsg, CountResponse} from "./msg";
import {STATE} from "./state";

function Ok(res: Response): Result<Response, string> {
	return Result.Ok<Response, string>(res);
}

function Err(msg: string): Result<Response, string> {
	return Result.Err<Response, string>(msg);
}

export function instantiateFn(env: Env, info: Info, msg: InstantiateMsg): Result<Response, string> {

	STATE().save({
		owner: info.sender,
		count: msg.count,
	});

	let res = Response.new_();
	return Ok(res);
}

export function executeFn(env: Env, info: Info, msg: ExecuteMsg): Result<Response, string> {
	if (msg.increment) {
		return try_increment(env, info);
	} else if (msg.reset) {
		return try_reset(env, info, msg.reset!.count);
	} else {
		return Err("Unknown message");
	}
}

function try_increment(env: Env, info: Info): Result<Response, string> {
	let _state = STATE().load();
	if (_state.isErr) {
		return Err(_state.unwrapErr());
	}
	let state = _state.unwrap();
	state.count += 1;
	let _save = STATE().save(state);
	if (_save.isErr) {
		return Err(_save.unwrapErr());
	}

	return Ok(Response.new_().addAttribute("method", "increment"));
}

function try_reset(env: Env, info: Info, count: i32): Result<Response, string> {
	let _state = STATE().load();
	if (_state.isErr) {
		return Err(_state.unwrapErr());
	}
	let state = _state.unwrap();
	if (info.sender !== state.owner) {
		return Err("Unauthorized");
	}

	state.count = count;
	let _save = STATE().save(state);
	if (_save.isErr) {
		return Err(_save.unwrapErr());
	}

	return Ok(Response.new_().addAttribute("method", "reset"));
}


export function queryFn(env: Env, msg: QueryMsg): Result<Binary, string> {
	if (msg.get_count) {
		let _q = query_count();
		if (_q.isOk) {
			return to_binary<CountResponse>(_q.unwrap());
		}
	}
	return Result.Err<Binary, string>("Unknown query");
}

export function query_count(): Result<CountResponse, string> {
	let _state = STATE().load();
	if (_state.isErr) {
		return Result.Err<CountResponse, string>(_state.unwrapErr());
	}
	let state = _state.unwrap();
	return Result.Ok<CountResponse, string>({count: state.count});
	
}
