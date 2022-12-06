import { Binary } from "@cosmwasm-as/std";
import { JSON } from "json-as/assembly";
import { Expiration } from "./expiration";
import { Logo, LogoInfo } from "./logo";

// ===== Instantiate =====
@json
export class InstantiateMsg {
	minter: string | null;
	marketing: string | null;
	name: string;
	symbol: string;
	project: string | null;
	description: string | null;
	decimals: i8;
}

// ===== Execute =====
@json
export class ExecuteTransferMsg {
	recipient: string;
	amount: u64;
}

@json
export class ExecuteTransferFromMsg {
	owner: string;
	recipient: string;
	amount: u64;
}

@json
export class ExecuteSendMsg {
	contract: string;
	amount: u64;
	msg: Binary;
}

@json
export class ExecuteSendFromMsg {
	owner: string;
	contract: string;
	amount: u64;
	msg: Binary;
}

@json
export class ExecuteMintMsg {
	recipient: string;
	amount: u64;
}

@json
export class ExecuteBurnMsg {
	amount: u64;
}

@json
export class ExecuteBurnFromMsg {
	owner: string;
	amount: u64;
}

@json
export class ExecuteIncreaseAllowanceMsg {
	spender: string;
	amount: u64;
	expires: Expiration | null;
}

@json
export class ExecuteDecreaseAllowanceMsg {
	spender: string;
	amount: u64;
	expires: Expiration | null;
}

@json
export class ExecuteUpdateMinterMsg {
	new_minter: string | null;
}

@json
export class ExecuteUpdateMarketingMsg {
	project: string | null;
	description: string | null;
	marketing: string | null;
}

@json
export class ExecuteMsg {
	transfer: ExecuteTransferMsg | null;
	transfer_from: ExecuteTransferFromMsg | null;
	send: ExecuteSendMsg | null;
	send_from: ExecuteSendFromMsg | null;
	mint: ExecuteMintMsg | null;
	burn: ExecuteBurnMsg | null;
	burn_from: ExecuteBurnFromMsg | null;
	increase_allowance: ExecuteIncreaseAllowanceMsg | null;
	decrease_allowance: ExecuteDecreaseAllowanceMsg | null;
	update_minter: ExecuteUpdateMinterMsg | null;
	update_marketing: ExecuteUpdateMarketingMsg | null;
	upload_logo: Logo | null;
}

// ===== Query =====
@json
export class QueryBalanceMsg {
	address: string;
}

@json
export class QueryTokenInfoMsg {}

@json
export class QueryMarketingInfoMsg {}

@json
export class QueryMinterMsg {}

@json
export class QueryAllowanceMsg {
	owner: string;
	spender: string;
}

@json
export class QueryMsg {
	balance: QueryBalanceMsg | null;
	token_info: QueryTokenInfoMsg | null;
	marketing_info: QueryMarketingInfoMsg | null;
	minter: QueryMinterMsg | null;
	allowance: QueryAllowanceMsg | null;
}

// ===== Query Response =====
@json
export class QueryBalanceResponse {
	balance: u64;
}

@json
export class QueryTokenInfoResponse {
	name: string;
	symbol: string;
	decimal: u8;
	total_supply: u64;
}

@json
export class QueryMinterResponse {
	minter: string | null;
	cap: u64;
}

@json
export class QueryAllowanceResponse {
	amount: u64;
	expires: Expiration;
}

@json
export class QueryMarketingInfoResponse {
	project: string | null;
	description: string | null;
	logo: LogoInfo | null;
	marketing: string | null;
}

// ===== Receive Message =====
@json
export class ReceiveBody {
	sender: string;
	amount: u64;
	msg: Binary;
}

@json
export class ReceiveMsg {
	receive: ReceiveBody;
}
