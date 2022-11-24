#!/usr/bin/env node
// rewrite the wasm file to call ~start before each entrypoint
import {readFileSync, writeFileSync} from "fs";
import binaryen from "binaryen";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const wasm = readFileSync(argv._[0]);
const mod = binaryen.readBinary(wasm);

function addStartToFunction(funcName) {
	const func = mod.getFunction(funcName);
	if (func === 0) { // function does not exist
		return;
	}

	const funcInfo = binaryen.getFunctionInfo(func);
	const callStart = mod.call("~start", [], binaryen.none);
	const block = mod.block("", [callStart, funcInfo.body], funcInfo.results);
	mod.addFunction("tmp", funcInfo.params, funcInfo.results, funcInfo.vars, block);
	const tmpInfo = binaryen.getFunctionInfo(mod.getFunction("tmp"));
	mod.removeFunction(funcName);
	mod.addFunction(funcName, tmpInfo.params, tmpInfo.results, tmpInfo.vars, tmpInfo.body);
	mod.removeFunction("tmp");
}


mod.removeExport("_start");

// get all exports
const numExports = mod.getNumExports();
for (let i = 0; i < numExports; i++) {
	const exp = mod.getExportByIndex(i);
	const info = binaryen.getExportInfo(exp);
	// if it's a function, add a start call
	if (info.kind === binaryen.ExternalFunction) {
		addStartToFunction(info.value);
	}
}

// remove file extension from path
let wasmName = argv._[0].split(".")[0];

if (argv['optimize']) {
	mod.optimize();
}

mod.validate();

// write the new wat file
writeFileSync(wasmName + ".wat", mod.emitText());

// write the new wasm file
writeFileSync(wasmName + ".wasm", mod.emitBinary());
