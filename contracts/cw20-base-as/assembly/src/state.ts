import { JSON } from "json-as";
import { Item, Map } from "@cosmwasm-as/std";
import { Expiration } from "./expiration";

@json
export class State {
	minter: string | null;
	marketing: string | null;
	name: string;
	symbol: string;
	decimals: u8;
	// TODO: try v128?
	total_supply: u64;
}

@json
export class AllowanceKey {
	owner: string;
	spender: string;
}

@json
export class Allowance {
	amount: u64;
	expires: Expiration;
}

export function STATE(): Item<State> {
	return new Item<State>("state");
}

export function BALANCES(): Map<string, u64> {
	return new Map<string, u64>('balances');
}

export function ALLOWANCES(): Map<AllowanceKey, Allowance> {
	return new Map<AllowanceKey, Allowance>('allowances');
}
