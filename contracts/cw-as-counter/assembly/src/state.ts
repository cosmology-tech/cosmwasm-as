import {JSON} from "json-as/assembly";
import {Item} from "@cosmwasm-as/std";

@json
export class State {
	owner: string;
	count: i32;
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

export function STATE(): Item<State> {
	return new Item<State>("state");
}
