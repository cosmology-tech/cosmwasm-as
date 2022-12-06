import { Binary, Response, Env, Info, to_binary, debug, Region } from "@cosmwasm-as/std";
import { Result } from "as-container";
import { JSON } from "json-as";
import { Expiration } from "./expiration";
import { Logo, LogoInfo } from "./logo";
import { InstantiateMsg, ExecuteMsg, QueryMsg, ExecuteTransferMsg, ExecuteSendMsg, ExecuteBurnMsg, ExecuteMintMsg, ReceiveMsg, QueryBalanceMsg, QueryTokenInfoMsg, QueryMinterMsg, QueryBalanceResponse, QueryTokenInfoResponse, QueryMinterResponse, ExecuteSendFromMsg, ExecuteTransferFromMsg, ExecuteBurnFromMsg, ExecuteIncreaseAllowanceMsg, ExecuteDecreaseAllowanceMsg, QueryAllowanceMsg, QueryAllowanceResponse, QueryMarketingInfoMsg, QueryMarketingInfoResponse, ExecuteUpdateMinterMsg, ExecuteUpdateMarketingMsg } from "./msg";
import { ALLOWANCES, BALANCES, STATE } from "./state";

function Ok<T = Response>(res: T): Result<T, string> {
	return Result.Ok<T, string>(res);
}

function Err<T = Response>(msg: string): Result<T, string> {
	return Result.Err<T, string>(msg);
}

export function instantiateFn(env: Env, info: Info, msg: InstantiateMsg): Result<Response, string> {
	STATE().save({
		minter: msg.minter !== null ? msg.minter as string : info.sender,
		marketing: msg.marketing !== null ? msg.marketing as string : info.sender,
		name: msg.name,
		symbol: msg.symbol,
		project: msg.project !== null ? msg.project as string : "",
		description: msg.description !== null ? msg.description as string : "",
		logo: null,
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
	if (msg.transfer_from) {
		return try_transfer_from(env, info, msg.transfer_from as ExecuteTransferFromMsg);
	}
	else if (msg.send) {
		return try_send(env, info, msg.send as ExecuteSendMsg);
	}
	else if (msg.send_from) {
		return try_send_from(env, info, msg.send_from as ExecuteSendFromMsg);
	}
	else if (msg.mint) {
		return try_mint(env, info, msg.mint as ExecuteMintMsg);
	}
	else if (msg.burn) {
		return try_burn(env, info, msg.burn as ExecuteBurnMsg);
	}
	else if (msg.burn_from) {
		return try_burn_from(env, info, msg.burn_from as ExecuteBurnFromMsg);
	}
	else if (msg.increase_allowance) {
		return try_increase_allowance(env, info, msg.increase_allowance as ExecuteIncreaseAllowanceMsg);
	}
	else if (msg.decrease_allowance) {
		return try_decrease_allowance(env, info, msg.decrease_allowance as ExecuteDecreaseAllowanceMsg);
	}
	else if (msg.update_minter) {
		return try_update_minter(env, info, msg.update_minter as ExecuteUpdateMinterMsg);
	}
	else if (msg.update_marketing) {
		return try_update_marketing(env, info, msg.update_marketing as ExecuteUpdateMarketingMsg);
	}
	else if (msg.upload_logo) {
		return try_upload_logo(env, info, msg.upload_logo as Logo);
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

function try_transfer_from(env: Env, info: Info, msg: ExecuteTransferFromMsg): Result<Response, string> {
	const r1 = decreaseAllowance(env, msg.owner, info.sender, msg.amount, null);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	const r2 = decreaseBalance(msg.owner, msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	
	const r3 = increaseBalance(msg.recipient, msg.amount);
	if (r3.isErr)
		return Err<Response>(r3.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'transfer_from')
		.addAttribute('sender', msg.owner)
		.addAttribute('spender', info.sender)
		.addAttribute('recipient', msg.recipient)
		.addAttribute('amount', msg.amount.toString())
	);
}

function try_send(env: Env, info: Info, msg: ExecuteSendMsg): Result<Response, string> {
	const r1 = try_transfer(env, info, { recipient: msg.contract, amount: msg.amount });
	if (r1.isErr) return r1;
	
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

function try_send_from(env: Env, info: Info, msg: ExecuteSendFromMsg): Result<Response, string> {
	const r1 = try_transfer_from(env, info, { owner: msg.owner, recipient: msg.contract, amount: msg.amount });
	if (r1.isErr) return r1;
	
	const recvMsg = to_binary<ReceiveMsg>({
		receive: {
			sender: msg.owner,
			amount: msg.amount,
			msg: msg.msg,
		},
	});
	if (recvMsg.isErr)
		return Err<Response>(recvMsg.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'send_from')
		.addAttribute('sender', msg.owner)
		.addAttribute('spender', info.sender)
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
				},
			},
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

function try_burn_from(env: Env, info: Info, msg: ExecuteBurnFromMsg): Result<Response, string> {
	const r1 = decreaseAllowance(env, msg.owner, info.sender, msg.amount, null);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	const r2 = decreaseBalance(msg.owner, msg.amount);
	if (r2.isErr)
		return Err<Response>(r2.unwrapErr());
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'burn_from')
		.addAttribute('owner', msg.owner)
		.addAttribute('spender', info.sender)
		.addAttribute('amount', msg.amount.toString())
	);
}

function try_increase_allowance(env: Env, info: Info, msg: ExecuteIncreaseAllowanceMsg): Result<Response, string> {
	const r1 = increaseAllowance(env, info.sender, msg.spender, msg.amount, msg.expires);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'increase_allowance')
		.addAttribute('owner', info.sender)
		.addAttribute('spender', msg.spender)
		.addAttribute('amount', msg.amount.toString())
		.addAttribute('expires', JSON.stringify<Expiration | null>(msg.expires))
	);
}

function try_decrease_allowance(env: Env, info: Info, msg: ExecuteDecreaseAllowanceMsg): Result<Response, string> {
	const rAllowance = ALLOWANCES().load({ owner: info.sender, spender: msg.spender });
	
	// no existing allowance
	if (rAllowance.isErr) {
		const r1 = clearAllowance(info.sender, msg.spender, msg.expires);
		if (r1.isErr)
			return Err<Response>(r1.unwrapErr());
	}
	
	// has existing stored
	else {
		const allowance = rAllowance.unwrap();
		
		// existing allowance expired
		const rExpired = allowance.expires.isExpired(env);
		if (rExpired.isErr)
			return Err<Response>(rExpired.unwrapErr());
		if (rExpired.unwrap() || allowance.amount < msg.amount) {
			const r1 = clearAllowance(info.sender, msg.spender, msg.expires);
			if (r1.isErr)
				return Err<Response>(r1.unwrapErr());
		}
		// existing allowance has not expired: defer to decreaseAllowance
		// note: cannot use decreaseAllowance for above cases as it would error instead of clearing
		else {
			const r1 = decreaseAllowance(env, info.sender, msg.spender, msg.amount, msg.expires);
			if (r1.isErr)
				return Err<Response>(r1.unwrapErr());
		}
	}
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'decrease_allowance')
		.addAttribute('owner', info.sender)
		.addAttribute('spender', msg.spender)
		.addAttribute('amount', msg.amount.toString())
		.addAttribute('expires', JSON.stringify<Expiration | null>(msg.expires))
	);
}

function try_update_minter(env: Env, info: Info, msg: ExecuteUpdateMinterMsg): Result<Response, string> {
	const newMinter = msg.new_minter !== null ? msg.new_minter as string : "";
	const rIsMinter = isMinter(info.sender);
	if (rIsMinter.isErr)
		return Err<Response>(rIsMinter.unwrapErr());
	if (!rIsMinter.unwrap())
		return Err<Response>('unauthorized');
	
	const state = STATE().load().unwrap();
	state.minter = newMinter;
	
	const r1 = STATE().save(state);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'update_minter')
		.addAttribute('new_minter', newMinter)
	);
}

function try_update_marketing(env: Env, info: Info, msg: ExecuteUpdateMarketingMsg): Result<Response, string> {
	const state = STATE().load().unwrap();
	const newProject = msg.project !== null ? msg.project as string : state.project;
	const newDescription = msg.description !== null ? msg.description as string : state.description;
	const newMarketing = msg.marketing !== null ? msg.marketing as string : state.marketing;
	
	if (info.sender !== state.marketing)
		return Err<Response>('unauthorized');
	
	state.project = newProject;
	state.description = newDescription;
	state.marketing = newMarketing;
	const r1 = STATE().save(state);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'update_marketing')
		.addAttribute('project', newProject)
		.addAttribute('description', newDescription)
		.addAttribute('marketing', newMarketing)
	);
}

function try_upload_logo(env: Env, info: Info, logo: Logo): Result<Response, string> {
	const state = STATE().load().unwrap();
	if (state.marketing !== info.sender)
		return Err<Response>('unauthorized');
	
	state.logo = logo;
	const r1 = STATE().save(state);
	if (r1.isErr)
		return Err<Response>(r1.unwrapErr());
	
	return Ok<Response>(Response.new_()
		.addAttribute('action', 'upload_logo')
	);
}

export function queryFn(env: Env, msg: QueryMsg): Result<Binary, string> {
	if (msg.balance) {
		return query_balance(env, msg.balance as QueryBalanceMsg);
	}
	if (msg.allowance) {
		return query_allowance(env, msg.allowance as QueryAllowanceMsg);
	}
	else if (msg.token_info) {
		return query_token_info(env, msg.token_info as QueryTokenInfoMsg);
	}
	else if (msg.minter) {
		return query_minter(env, msg.minter as QueryMinterMsg);
	}
	else if (msg.marketing_info) {
		return query_marketing(env, msg.marketing_info as QueryMarketingInfoMsg);
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

function query_allowance(env: Env, msg: QueryAllowanceMsg): Result<Binary, string> {
	const rAllowance = ALLOWANCES().load({ owner: msg.owner, spender: msg.spender });
	if (rAllowance.isErr)
		return Err<Binary>(rAllowance.unwrapErr());
	
	const allowance = rAllowance.unwrap();
	if (allowance.expires.isExpired(env).unwrapOr(true)) {
		return to_binary<QueryAllowanceResponse>({
			amount: 0,
			expires: Expiration.default(),
		});
	} else {
		return to_binary<QueryAllowanceResponse>({
			amount: allowance.amount,
			expires: allowance.expires,
		});
	}
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
		cap: 0,
	});
	if (rBin.isErr)
		return Err<Binary>(rBin.unwrapErr());
	return Ok<Binary>(rBin.unwrap());
}

function query_marketing(env: Env, msg: QueryMarketingInfoMsg): Result<Binary, string> {
	const state = STATE().load().unwrap();
	
	return to_binary<QueryMarketingInfoResponse>({
		project: state.project,
		description: state.description,
		logo: state.logo ? getLogoInfo(state.logo as Logo) : null,
		marketing: state.marketing,
	});
}

function isMinter(addr: string): Result<bool, string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Err<bool>(r1.unwrapErr());
	return Ok<bool>(r1.unwrap().minter === addr);
}

function increaseBalance(owner: string, amount: u64): Result<"unit", string> {
	const balance = BALANCES().load(owner).unwrapOr(0);
	const result = BALANCES().save(owner, balance + amount);
	if (result.isErr)
		return Err<"unit">(result.unwrapErr());
	return Ok<"unit">("unit");
}

function decreaseBalance(owner: string, amount: u64): Result<"unit", string> {
	const balance = BALANCES().load(owner).unwrapOr(0);
	if (balance < amount)
		return Err<"unit">('insufficient funds');
	
	const result = BALANCES().save(owner, balance - amount);
	if (result.isErr)
		return Err<"unit">(result.unwrapErr());
	return Ok<"unit">("unit");
}

function getAllowance(env: Env, owner: string, spender: string): Result<u64, string> {
	const rAllowance = ALLOWANCES().load({ owner, spender });
	if (rAllowance.isErr)
		// TODO: cannot currently (reliably) discern between key-not-found & other errors
		return Ok<u64>(0);
	
	const allowance = rAllowance.unwrap();
	const rExpired = allowance.expires.isExpired(env);
	debug(Region.allocateAndWriteStr(JSON.stringify<Expiration>(allowance.expires)).ptr);
	if (rExpired.isErr)
		return Err<u64>(rExpired.unwrapErr());
	return Ok<u64>(rExpired.unwrap() ? 0 : allowance.amount);
}

function setAllowance(owner: string, spender: string, amount: u64, expires: Expiration): Result<"unit", string> {
	const r1 = ALLOWANCES().save(
		{ owner, spender },
		{
			amount,
			expires,
		},
	);
	if (r1.isErr)
		return Err<"unit">(r1.unwrapErr());
	return Ok<"unit">("unit");
}

function increaseAllowance(env: Env, owner: string, spender: string, amount: u64, expires: Expiration | null): Result<"unit", string> {
	const rAllowance = getAllowance(env, owner, spender);
	if (rAllowance.isErr)
		return Err<"unit">(rAllowance.unwrapErr());
	
	const allowance = rAllowance.unwrap();
	return setAllowance(owner, spender, allowance + amount, expires === null ? Expiration.default() : expires);
}

function decreaseAllowance(env: Env, owner: string, spender: string, amount: u64, expires: Expiration | null): Result<"unit", string> {
	const rAllowance = ALLOWANCES().load({ owner, spender });
	if (rAllowance.isErr)
		return Err<"unit">(rAllowance.unwrapErr());
	
	const allowance = rAllowance.unwrap();
	const rExpired = allowance.expires.isExpired(env);
	if (rExpired.isErr)
		return Err<"unit">(rExpired.unwrapErr());
	
	if (rExpired.unwrap() || allowance.amount < amount) {
		return Err<"unit">('insufficient allowance');
	} else {
		return setAllowance(owner, spender, allowance.amount - amount, expires ? expires : allowance.expires);
	}
}

function clearAllowance(owner: string, spender: string, expires: Expiration | null): Result<"unit", string> {
	return ALLOWANCES().save({ owner, spender }, {
		amount: 0,
		expires: expires === null ? Expiration.default() : expires,
	});
}

function increaseTotalSupply(amount: u64): Result<"unit", string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Err<"unit">(r1.unwrapErr());
	
	const state = r1.unwrap();
	state.total_supply += amount;
	const r2 = STATE().save(state);
	if (r2.isErr)
		return Err<"unit">(r2.unwrapErr());
	return Ok<"unit">("unit");
}

function decreaseTotalSupply(amount: u64): Result<"unit", string> {
	const r1 = STATE().load();
	if (r1.isErr)
		return Err<"unit">(r1.unwrapErr());
	
	const state = r1.unwrap();
	state.total_supply -= amount;
	const r2 = STATE().save(state);
	if (r2.isErr)
		return Err<"unit">(r2.unwrapErr());
	return Ok<"unit">("unit");
}

function getLogoInfo(logo: Logo): LogoInfo {
	if (logo.url) {
		return {
			url: logo.url,
			embedded: null,
		};
	}
	else if (logo.embedded) {
		return {
			url: null,
			embedded: {},
		};
	}
	throw new Error('Invalid Logo enum');
}
