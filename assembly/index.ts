// This file is important for the AssemblyScript compiler to correctly construct
// the WASM module, and should be common to all CosmWasm AssemblyScript projects.
// To program your contract, you should modify code in the `./contract` folder.

// Required Wasm exports
export {
  interface_version_8,
  instantiate,
  allocate,
  deallocate
} from './cosmwasm/exports';

// Options Wasm exports
export {
  execute,
  query,
} from './cosmwasm/exports';

import { abort } from './cosmwasm/imports';

export function logAndCrash(
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

  abort(msg.length);
  unreachable(); // crash hard
}
