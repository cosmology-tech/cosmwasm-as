import { JSON } from "json-as";
import { Item, Map } from "@cosmwasm-as/std";

@json
export class State {
	minter: string | null;
	marketing: string | null;
	name: string;
	symbol: string;
	decimals: u8;
	total_supply: u64;
}

export function STATE(): Item<State> {
	return new Item<State>("state");
}

export function BALANCES(): Map<string, u64> {
	return new Map<string, u64>('balances');
}
