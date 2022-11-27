import {Binary, Response, Env, Info, to_binary} from "@cosmwasm-as/std";
import {Result} from "as-container";
import {InstantiateMsg, ExecuteMsg, QueryMsg, Cw20ReceiveMsg, Cw20Coin} from "./msg";
import {TOKEN_INFO, BALANCES, ALLOWANCES, TokenInfo, MinterData} from "./state";

function Ok(res: Response): Result<Response, string> {
	return Result.Ok<Response, string>(res);
}

function Err(msg: string): Result<Response, string> {
	return Result.Err<Response, string>(msg);
}

function create_accounts(accounts: Cw20Coin[]): Result<u64, string> {
	let total: u64 = 0;
	for (let i = 0; i < accounts.length; i++) {
		let account = accounts[i];
		let balance = BALANCES().load(account.address).unwrapOr(0);
		BALANCES().save(account.address, balance + account.amount);
		total += account.amount;
	}
	return Result.Ok<u64, string>(total);
}

export function instantiateFn(env: Env, info: Info, msg: InstantiateMsg): Result<Response, string> {
	let total_supply = create_accounts(msg.initial_balances).unwrap();

	if (msg.mint && msg.mint!.cap && total_supply > msg.mint!.cap!.value) {
		return Err("Initial supply exceeds mint cap");
	}

	let mint: MinterData | null = null;
	if (msg.mint) {
		mint = {
			minter: msg.mint!.minter,
			cap: msg.mint!.cap
		};
	}

	let data: TokenInfo = {
		name: msg.name,
		symbol: msg.symbol,
		decimals: msg.decimals,
		total_supply,
		mint
	};

	TOKEN_INFO().save(data);

	return Ok(Response.new_());
}

export function executeFn(env: Env, info: Info, msg: ExecuteMsg): Result<Response, string> {
	if (msg.transfer) {
		return execute_transfer(env, info, msg.transfer!.recipient, msg.transfer!.amount);
	} else if (msg.burn) {
		return execute_burn(env, info, msg.burn!.amount);
	} else if (msg.send) {
		return execute_send(env, info, msg.send!.contract, msg.send!.amount, msg.send!.msg);
	} else if (msg.mint) {
		return execute_mint(env, info, msg.mint!.recipient, msg.mint!.amount);
	} else if (msg.increase_allowance) {
		return execute_increase_allowance(env, info, msg.increase_allowance!.spender, msg.increase_allowance!.amount);
	} else if (msg.decrease_allowance) {
		return execute_decrease_allowance(env, info, msg.decrease_allowance!.spender, msg.decrease_allowance!.amount);
	} else if (msg.transfer_from) {
		return execute_transfer_from(env, info, msg.transfer_from!.owner, msg.transfer_from!.recipient, msg.transfer_from!.amount);
	} else if (msg.burn_from) {
		return execute_burn_from(env, info, msg.burn_from!.owner, msg.burn_from!.amount);
	} else if (msg.send_from) {
		return execute_send_from(env, info, msg.send_from!.owner, msg.send_from!.contract, msg.send_from!.amount, msg.send_from!.msg);
	} else if (msg.update_minter) {
		return execute_update_minter(env, info, msg.update_minter!.new_minter);
	} else {
		return Err("Unknown message");
	}
}

function execute_transfer(env: Env, info: Info, recipient: string, amount: u64): Result<Response, string> {
	if (amount === 0) {
		return Err("Invalid Zero Amount");
	}

	let senderBalance = BALANCES().load(info.sender).unwrapOr(0);
	if (senderBalance < amount) {
		return Err("Insufficient funds");
	}

	BALANCES().save(info.sender, senderBalance - amount);
	let recipientBalance = BALANCES().load(recipient).unwrapOr(0);
	BALANCES().save(recipient, recipientBalance + amount);

	let res = Response.new_()
		.addAttribute("action", "transfer")
		.addAttribute("from", info.sender)
		.addAttribute("to", recipient)
		.addAttribute("amount", amount.toString());
	return Ok(res);
}

function execute_burn(env: Env, info: Info, amount: u64): Result<Response, string> {
	if (amount === 0) {
		return Err("Invalid Zero Amount");
	}

	let senderBalance = BALANCES().load(info.sender).unwrapOr(0);
	if (senderBalance < amount) {
		return Err("Insufficient funds");
	}

	BALANCES().save(info.sender, senderBalance - amount);

	let res = Response.new_()
		.addAttribute("action", "burn")
		.addAttribute("from", info.sender)
		.addAttribute("amount", amount.toString());
	return Ok(res);
}


function execute_send(env: Env, info: Info, contract: string, amount: u64, msg: Binary): Result<Response, string> {
	if (amount === 0) {
		return Err("Invalid Zero Amount");
	}

	let senderBalance = BALANCES().load(info.sender).unwrapOr(0);
	if (senderBalance < amount) {
		return Err("Insufficient funds");
	}

	BALANCES().save(info.sender, senderBalance - amount);
	let recipientBalance = BALANCES().load(contract).unwrapOr(0);
	BALANCES().save(contract, recipientBalance + amount);
	let res = Response.new_()
		.addAttribute("action", "send")
		.addAttribute("from", info.sender)
		.addAttribute("to", contract)
		.addAttribute("amount", amount.toString())
		.addMessage(
			new Cw20ReceiveMsg(
				info.sender,
				amount,
				msg
			).intoCosmosMsg(contract));

	return Ok(res);
}

function execute_mint(env: Env, info: Info, recipient: string, amount: u64): Result<Response, string> {
	if (amount === 0) {
		return Err("Invalid Zero Amount");
	}

	let config = TOKEN_INFO().load().unwrap();
	if (config.mint && config.mint!.minter === info.sender) {
		config.total_supply += amount;
		if (config.mint!.cap !== null && config.total_supply > config.mint!.cap!.value) {
			return Err("Mint cap exceeded");
		}
		TOKEN_INFO().save(config);

		let recipientBalance = BALANCES().load(recipient).unwrapOr(0);
		BALANCES().save(recipient, recipientBalance + amount);
		let res = Response.new_()
			.addAttribute("action", "mint")
			.addAttribute("to", recipient)
			.addAttribute("amount", amount.toString());
		return Ok(res);
	} else {
		return Err("Unauthorized");
	}
}

function execute_increase_allowance(env: Env, info: Info, spender: string, amount: u64): Result<Response, string> {
	return Err("Not implemented");
}

function execute_decrease_allowance(env: Env, info: Info, spender: string, amount: u64): Result<Response, string> {
	return Err("Not implemented");
}

function execute_transfer_from(env: Env, info: Info, owner: string, recipient: string, amount: u64): Result<Response, string> {
	return Err("Not implemented");
}

function execute_burn_from(env: Env, info: Info, owner: string, amount: u64): Result<Response, string> {
	return Err("Not implemented");
}

function execute_send_from(env: Env, info: Info, owner: string, contract: string, amount: u64, msg: Binary): Result<Response, string> {
	return Err("Not implemented");
}

function execute_update_minter(env: Env, info: Info, new_minter: string | null): Result<Response, string> {
	return Err("Not implemented");
}

export function queryFn(env: Env, msg: QueryMsg): Result<Binary, string> {
	return Result.Err<Binary, string>("Unknown query");
}
