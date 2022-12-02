import { Binary } from "@cosmwasm-as/std";
import { JSON } from "json-as/assembly";

// ===== Instantiate =====
@json
export class InstantiateMsg {
	minter: string | null;
	marketing: string | null;
	name: string;
	symbol: string;
	decimals: i8;
}

// ===== Execute =====
@json
export class ExecuteTransferMsg {
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
export class ExecuteMintMsg {
	recipient: string;
	amount: u64;
}

@json
export class ExecuteBurnMsg {
	amount: u64;
}

@json
export class ExecuteMsg {
	transfer: ExecuteTransferMsg | null;
	send: ExecuteSendMsg | null;
	mint: ExecuteMintMsg | null;
	burn: ExecuteBurnMsg | null;
}

// ===== Query =====
@json
export class QueryBalanceMsg {
	address: string;
}

@json
export class QueryTokenInfoMsg {}

@json
export class QueryMinterMsg {}

@json
export class QueryMsg {
	balance: QueryBalanceMsg | null;
	token_info: QueryTokenInfoMsg | null;
	minter: QueryMinterMsg | null;
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
