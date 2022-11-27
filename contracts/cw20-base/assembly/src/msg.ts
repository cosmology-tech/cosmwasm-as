import {JSON} from "json-as/assembly";
import {Binary, WasmExecuteMsg, Box, WasmMsg, from_binary, to_binary, CosmosMsg} from "@cosmwasm-as/std";
import {Result} from "as-container";

@json
export class Cw20Coin {
	address: string;
	amount: u64;
}

@json
export class InstantiateMsg {
	name: string;
	symbol: string;
	decimals: u8;
	initial_balances: Cw20Coin[];
	mint: MinterResponse | null;
}

@json
export class TransferBody {
	recipient: string;
	amount: u64;
}

@json
export class BurnBody {
	amount: u64
}

@json
export class SendBody {
	contract: string;
	amount: u64;
	msg: Binary;
}

@json
export class IncreaseAllowanceBody {
	spender: string;
	amount: u64;
	// expires: Option<Expiration>;
}

@json
export class DecreaseAllowanceBody {
	spender: string;
	amount: u64;
	// expires: Option<Expiration>;
}

@json
export class TransferFromBody {
	owner: string;
	recipient: string;
	amount: u64;
}

@json
export class SendFromBody {
	owner: string;
	contract: string;
	amount: u64;
	msg: Binary;
}

@json
export class BurnFromBody {
	owner: string;
	amount: u64;
}

@json
export class MintBody {
	recipient: string;
	amount: u64;
}

@json
export class UpdateMinterBody {
	new_minter: string | null;
}

@json
export class ExecuteMsg {
	transfer: TransferBody | null;
	burn: BurnBody | null;
	send: SendBody | null;
	increase_allowance: IncreaseAllowanceBody | null;
	decrease_allowance: DecreaseAllowanceBody | null;
	transfer_from: TransferFromBody | null;
	send_from: SendFromBody | null;
	burn_from: BurnFromBody | null;
	mint: MintBody | null;
	update_minter: UpdateMinterBody | null;
}

@json
export class BalanceBody {
	address: string;
}

@json
export class TokenInfoBody {
}

@json
export class MinterBody {
}

@json
export class AllowanceBody {
	owner: string;
	spender: string;
}

@json
export class AllAllowancesBody {
	owner: string;
	start_after: string | null;
	limit: Box<u32> | null;
}

@json
export class AllSpenderAllowancesBody {
	spender: string;
	start_after: string | null;
	limit: Box<u32> | null;
}

@json
export class AllAccountsBody {
	start_after: string | null;
	limit: Box<u32> | null;
}

@json
export class QueryMsg {
	balance: BalanceBody | null;
	token_info: TokenInfoBody | null;
	minter: MinterBody | null;
	allowance: AllowanceBody | null;
	all_allowances: AllAllowancesBody | null;
	all_spender_allowances: AllSpenderAllowancesBody | null;
	all_accounts: AllAccountsBody | null;
}

@json
export class BalanceResponse {
	balance: u64;
}

@json
export class TokenInfoResponse {
	name: string;
	symbol: string;
	decimals: u8;
	total_supply: u64;
}

@json
export class AllowanceResponse {
	allowance: u64;
	// expires: Option<Expiration>;
}

@json
export class MinterResponse {
	minter: string;
	cap: Box<u64> | null;
}

@json
export class AllowanceInfo {
	spender: string;
	allowance: u64;
}

@json
export class AllAllowancesResponse {
	allowances: AllowanceInfo[];
}

@json
export class SpenderAllowanceInfo {
	owner: string;
	allowance: u64;
}

@json
export class AllSpenderAllowancesResponse {
	allowances: SpenderAllowanceInfo[];
}

@json
export class AllAccountsResponse {
	accounts: string[];
}

@json
export class ReceiverExecuteMsg {
	receive: Cw20ReceiveMsg
}

@json
export class Cw20ReceiveMsg {
	sender: string;
	amount: u64;
	msg: Binary;

	constructor(sender: string, amount: u64, msg: Binary) {
		this.sender = sender;
		this.amount = amount;
		this.msg = msg;
	}

	intoCosmosMsg(contractAddress: string): CosmosMsg {
		let recvMsg = <ReceiverExecuteMsg>{receive: this};
		return CosmosMsg.WasmMsg(WasmMsg.Execute({
			msg: to_binary<ReceiverExecuteMsg>(recvMsg).unwrap(),
			contract_addr: contractAddress,
			funds: [],
		}));
	}
}
