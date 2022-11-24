// stuff to work nicely with AssemblyScript

import {Region} from "./types";
import {abort} from "./imports";

/*
 * AssemblyScript normally imports a `env.abort`, which we need to override
 * because CosmWasm has its own `env.abort` function provided. This is an
 * adapter to make it work nicely with AssemblyScript.
 *
 * In your build script, you should have:
 *
 * ```bash
 * asc <...> --use abort=~lib/@cosmwasm-as/std/as/ABORT <...>
 * ```
 */
export function ABORT(
	message: string | null,
	fileName: string | null,
	lineNumber: u32,
	columnNumber: u32,
): void {
	const msg =
		"Aborted with message '" +
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(message || "unset")! +
		" (in '" +
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(fileName || "unset")! +
		"', line " +
		lineNumber.toString() +
		", column " +
		columnNumber.toString() +
		")";

	// Allocate msg
	const msgPtr = Region.allocateAndWriteStr(msg);
	abort(msgPtr.ptr);
	unreachable(); // crash hard
}
