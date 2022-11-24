import { JSON } from "json-as/assembly";
import {Option, Result} from "as-container";

import { Region } from "./types";
import { db_read, db_write } from "./imports";


export class Storage {
	get(key: Uint8Array): Option<Uint8Array> {
		let rKey = Region.allocate(key.length);
		rKey.write(key);

		let res = db_read(rKey.ptr);
		let rRes = Region.fromPtr(res);
		return Option.Some<Uint8Array>(rRes.read());
	}

	set(key: Uint8Array, value: Uint8Array): void {
		let rKey = Region.allocate(key.length);
		rKey.write(key);

		let rValue = Region.allocate(value.length);
		rValue.write(value);

		db_write(rKey.ptr, rValue.ptr);
	}
}

export class Item<T> {
	store: Storage;
	storageKey: Uint8Array;

	constructor(storageKey: string) {
		this.store = new Storage();
		this.storageKey = Uint8Array.wrap(String.UTF8.encode(storageKey));
	}

	save(value: T): Result<'unit', string> {
		let valueBuffer = Uint8Array.wrap(String.UTF8.encode(JSON.stringify(value)));
		this.store.set(this.storageKey, valueBuffer);
		return Result.Ok<'unit', string>("unit");
	}

	load(): Result<T, string> {
		let valueBuffer = this.store.get(this.storageKey);
		if (valueBuffer.isNone) {
			return Result.Err<T, string>("No value found");
		}
		let value = JSON.parse<T>(String.UTF8.decode(valueBuffer.unwrap().buffer));

		return Result.Ok<T, string>(value);
	}

	// TODO: to uncomment when AssemblyScript implements closures
	// update(action: (value: T) => Result<T, string>): Result<T, string> {
	// 	let input = this.load();
	// 	if (input.isErr) {
	// 		return input;
	// 	}
	// 	let output = action(input.unwrap());
	// 	if (output.isErr) {
	// 		return output;
	// 	}
	//
	// 	let res = this.save(output.unwrap());
	// 	if (res.isErr) {
	// 		return Result.Err<T, string>(res.unwrapErr());
	// 	}
	//
	// 	return Result.Ok<T, string>(output.unwrap());
	// }
}
