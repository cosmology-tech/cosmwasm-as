import {JSON} from "json-as/assembly";
import {Option, Result} from "as-container";

import {Region} from "./types";
import {db_read, db_write} from "./imports";


export class Storage {
	get(key: Uint8Array): Option<Uint8Array> {
		let rKey = Region.allocate(key.length);
		rKey.write(key);

		let res = db_read(rKey.ptr);
		let rRes = Region.fromPtr(res);
		let data = rRes.read();
		if (memcmp(data, new Uint8Array(8)) === 0)
			return Option.None<Uint8Array>();
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

class StorageHelper {
	store: Storage;
	storageKey: Uint8Array;
	storageKeyStr: string;

	constructor(storageKey: string) {
		this.store = new Storage();
		this.storageKeyStr = storageKey;
		this.storageKey = Uint8Array.wrap(String.UTF8.encode(storageKey));
	}
}

export class Item<T> extends StorageHelper {

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

export class Map<K, V> extends StorageHelper {

	private getKeyWithPrefix(key: K): Uint8Array {
		let keyWithPrefix = this.storageKeyStr.concat(JSON.stringify(key).slice(1, -1));
		return Uint8Array.wrap(String.UTF8.encode(keyWithPrefix));
	}

	save(key: K, value: V): Result<'unit', string> {
		// remove quotes
		let valueBuffer = Uint8Array.wrap(String.UTF8.encode(JSON.stringify(value)));
		this.store.set(this.getKeyWithPrefix(key), valueBuffer);
		return Result.Ok<'unit', string>("unit");
	}

	load(key: K): Result<V, string> {
		let valueBuffer = this.store.get(this.getKeyWithPrefix(key));
		if (valueBuffer.isNone) {
			return Result.Err<V, string>("No value found");
		}
		let value = JSON.parse<V>(String.UTF8.decode(valueBuffer.unwrap().buffer));
		return Result.Ok<V, string>(value);
	}
}

function memcmp(lhs: Uint8Array, rhs: Uint8Array): i32 {
	for (let i = 0; i < Math.min(lhs.length, rhs.length); ++i) {
		const diff = lhs[i] - rhs[i];
		if (diff !== 0) {
			return diff;
		}
	}
	if (lhs.length < rhs.length) {
		return -rhs[lhs.length];
	}
	if (lhs.length > rhs.length) {
		return  lhs[rhs.length];
	}
	return 0;
}
