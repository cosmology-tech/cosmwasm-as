import {JSON} from "json-as/assembly";
import {Box, Item, Map} from "@cosmwasm-as/std";

@json
export class TokenInfo {
	name: string;
	symbol: string;
	decimals: u8;
	total_supply: u64;
	mint: MinterData | null;
}

@json
export class MinterData {
	minter: string;
	cap: Box<u64> | null;
}

/**
 * Although it would be more similar to CosmWasm to do:
 *
 * ```ts
 * export const STATE = new Item<State>("state");
 * ```
 *
 * Wasmer doesn't like it, so we have to do this:
 */

export function TOKEN_INFO(): Item<TokenInfo> {
	return new Item<TokenInfo>("token_info");
}

export function BALANCES(): Map<string, u64> {
	return new Map<string, u64>("balances");
}

export function mk(owner: string, spender: string): string {
	return `${owner}${spender}`;
}

export function ALLOWANCES(): Map<string, u64> {
	return new Map<string, u64>("allowances");
}
