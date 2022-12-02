import { Binary, Response, Env, Info, to_binary, CosmosMsg } from "@cosmwasm-as/std";
import { Result } from "as-container";
import { InstantiateMsg, ExecuteMsg, QueryMsg, ExecuteTransferMsg, ExecuteSendMsg, ExecuteBurnMsg, ExecuteMintMsg, ReceiveMsg, QueryBalanceMsg, QueryTokenInfoMsg, QueryMinterMsg, QueryBalanceResponse, QueryTokenInfoResponse, QueryMinterResponse } from "./msg";
import { BALANCES, STATE } from "./state";

function Ok<T = Response>(res: T): Result<T, string> {
	return Result.Ok<T, string>(res);
}

function Err<T = Response>(msg: string): Result<T, string> {
	return Result.Err<T, string>(msg);
}

export function instantiateFn(env: Env, info: Info, msg: InstantiateMsg): Result<Response, string> {
	STATE().save({
		minter: msg.minter as string || info.sender,
		marketing: msg.marketing as string || info.sender,
		name: msg.name,
		symbol: msg.symbol,
		decimals: msg.decimals,
		total_supply: 0,
	});

	let res = Response.new_();
	return Ok(res);
}

export function executeFn(env: Env, info: Info, msg: ExecuteMsg): Result<Response, string> {
	if (msg.transfer) {
		return try_transfer(env, info, msg.transfer as ExecuteTransferMsg);
	}
	else if (msg.send) {
		return try_send(env, info, msg.send as ExecuteSendMsg);
	}
	else if (msg.mint) {
		return try_mint(env, info, msg.mint as ExecuteMintMsg);
	}
	else if (msg.burn) {
		return try_burn(env, info, msg.burn as ExecuteBurnMsg);
	}
	else {
		return Err("Unknown message");
	}
}

function try_transfer(env: Env, info: Info, msg: ExecuteTransferMsg): Result<Response, string> {
	const r1 = decreaseBalance(info.sender, msg.amount);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	const r2 = increaseBalance(msg.recipient, msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'transfer')
		.addAttribute('sender', info.sender)
		.addAttribute('recipient', msg.recipient)
		.addAttribute('amount', msg.amount.toString())
	);
}

function try_send(env: Env, info: Info, msg: ExecuteSendMsg): Result<Response, string> {
	const r1 = decreaseBalance(info.sender, msg.amount);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	const r2 = increaseBalance(msg.contract, msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	
	const recvMsg = to_binary<ReceiveMsg>({
		receive: {
			sender: info.sender,
			amount: msg.amount,
			msg: msg.msg,
		},
	});
	if (recvMsg.isErr)
		return Err<Response>(recvMsg.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'send')
		.addAttribute('sender', info.sender)
		.addAttribute('contract', msg.contract)
		.addAttribute('amount', msg.amount.toString())
		.addMessage({
			bank: null,
			wasm: {
				instantiate: null,
				execute: {
					contract_addr: msg.contract,
					funds: [],
					msg: recvMsg.unwrap(),
				}
			}
		})
	);
}

function try_mint(env: Env, info: Info, msg: ExecuteMintMsg): Result<Response, string> {
	const rIsMinter = isMinter(info.sender);
	if (rIsMinter.isErr)
		return Err<Response>(rIsMinter.unwrapErr());
	
	if (!rIsMinter.unwrap())
		return Err<Response>('unauthorized');
	
	const r1 = increaseBalance(msg.recipient, msg.amount);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	const r2 = increaseTotalSupply(msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'mint')
		.addAttribute('recipient', msg.recipient)
		.addAttribute('amount', msg.amount.toString())
	);
}

function try_burn(env: Env, info: Info, msg: ExecuteBurnMsg): Result<Response, string> {
	const r1 = decreaseBalance(info.sender, msg.amount);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	const r2 = decreaseTotalSupply(msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'burn')
		.addAttribute('owner', info.sender)
		.addAttribute('amount', msg.amount.toString())
	);
}

export function queryFn(env: Env, msg: QueryMsg): Result<Binary, string> {
	if (msg.balance) {
		return query_balance(env, msg.balance as QueryBalanceMsg);
	}
	else if (msg.token_info) {
		return query_token_info(env, msg.token_info as QueryTokenInfoMsg);
	}
	else if (msg.minter) {
		return query_minter(env, msg.minter as QueryMinterMsg);
	}
	else {
		return Err<Binary>("Unknown query");
	}
}

function query_balance(env: Env, msg: QueryBalanceMsg): Result<Binary, string> {
	const balance = BALANCES().load(msg.address).unwrapOr(0);
	
	const rBin = to_binary<QueryBalanceResponse>({ balance });
	if (rBin.isErr)
		return Err<Binary>(rBin.unwrapErr());
	return Ok<Binary>(rBin.unwrap());
}

function query_token_info(env: Env, msg: QueryTokenInfoMsg): Result<Binary, string> {
	const rState = STATE().load();
	if (rState.isErr)
		return Err<Binary>(rState.unwrapErr());
	
	const state = rState.unwrap();
	const rBin = to_binary<QueryTokenInfoResponse>({
		name: state.name,
		symbol: state.symbol,
		decimal: state.decimals,
		total_supply: state.total_supply,
	});
	if (rBin.isErr)
		return Err<Binary>(rBin.unwrapErr());
	return Ok<Binary>(rBin.unwrap());
}

function query_minter(env: Env, msg: QueryMinterMsg): Result<Binary, string> {
	const rState = STATE().load();
	if (rState.isErr)
		return Err<Binary>(rState.unwrapErr());
	
	const rBin = to_binary<QueryMinterResponse>({
		minter: rState.unwrap().minter,
		cap: null,
	});
	if (rBin.isErr)
		return Err<Binary>(rBin.unwrapErr());
	return Ok<Binary>(rBin.unwrap());
}

function isMinter(addr: string): Result<bool, string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Err<bool>(r1.unwrapErr());
	return Ok<bool>(r1.unwrap().minter === addr);
}

function increaseBalance(owner: string, amount: u64): Result<bool, string> {
	const balance = BALANCES().load(owner).unwrapOr(0);
	const result = BALANCES().save(owner, balance + amount);
	if (result.isErr)
		return Result.Err<bool, string>(result.unwrapErr());
	return Result.Ok<bool, string>(true);
}

function decreaseBalance(owner: string, amount: u64): Result<bool, string> {
	const balance = BALANCES().load(owner).unwrapOr(0);
	if (balance < amount)
		return Result.Err<bool, string>('insufficient funds');
	
	const result = BALANCES().save(owner, balance + amount);
	if (result.isErr)
		return Result.Err<bool, string>(result.unwrapErr());
	return Result.Ok<bool, string>(true);
}

function increaseTotalSupply(amount: u64): Result<bool, string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Result.Err<bool, string>(r1.unwrapErr());
	
	const state = r1.unwrap();
	state.total_supply += amount;
	const r2 = STATE().save(state);
	if (r2.isErr)
		return Result.Err<bool, string>(r2.unwrapErr());
	return Result.Ok<bool, string>(true);
}

function decreaseTotalSupply(amount: u64): Result<bool, string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Result.Err<bool, string>(r1.unwrapErr());
	
	const state = r1.unwrap();
	state.total_supply -= amount;
	const r2 = STATE().save(state);
	if (r2.isErr)
		return Result.Err<bool, string>(r2.unwrapErr());
	return Result.Ok<bool, string>(true);
}
