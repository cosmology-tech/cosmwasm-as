import {JSON} from "json-as/assembly";
import {allocate} from './exports';
import {encode, decode} from "as-base64/assembly";
import {Result} from "as-container";

@json
export class Info {
	sender: string;
	funds: Coin[];
}


@json
export class Env {
	block: EnvBlock;
	contract: EnvContract;
	transaction_info: EnvTransaction | null;
}

@json
export class EnvBlock {
	height: u64;
	time: string;
	chain_id: string;
}

@json
export class EnvContract {
	address: string;
}

@json
export class EnvTransaction {
	index: u64;
}

@json
export class Coin {
	denom: string;
	amount: string;
}

@json
export class Attribute {
	key: string;
	value: string;
}

@json
export class Event {
	type: string;
	attributes: Attribute[];
}

@json
export class CosmosMsg {
	wasm: WasmMsg | null;
	bank: BankMsg | null;

	static WasmMsg(msg: WasmMsg): CosmosMsg {
		return {
			wasm: msg,
			bank: null,
		}
	}

	static BankMsg(msg: BankMsg): CosmosMsg {
		return {
			wasm: null,
			bank: msg,
		}
	}
}

@json
export class BankMsg {
	send: BankSendMsg | null;
}

@json
export class BankSendMsg {
	to_address: string;
	amount: Coin[];
}

@json
export class WasmMsg {
	execute: WasmExecuteMsg | null;
	instantiate: WasmInstantiateMsg | null;

	static Execute(msg: WasmExecuteMsg): WasmMsg {
		return {
			execute: msg,
			instantiate: null,
		}
	}

	static Instantiate(msg: WasmInstantiateMsg): WasmMsg {
		return {
			execute: null,
			instantiate: msg,
		}
	}
}

@json
export class WasmExecuteMsg {
	contract_addr: string;
	msg: Binary;
	funds: Coin[];
}

@json
export class WasmInstantiateMsg {
	admin: string | null;
	code_id: u64;
	msg: Binary;
	funds: Coin[];
	label: string;
}


@json
export class Response {
	messages: SubMsg[];
	attributes: Attribute[];
	events: Event[];
	data: Binary | null;

	constructor(messages: SubMsg[] = [], attributes: Attribute[] = [], events: Event[] = [], data: Binary | null = null) {
		this.messages = messages;
		this.attributes = attributes;
		this.events = events;
		this.data = data;
	}

	static new(): Response {
		return new Response();
	}

	// alias
	static new_(): Response {
		return new Response();
	}

	addMessage(msg: CosmosMsg): Response {
		this.messages.push({
			id: 0,
			reply_on: "never",
			gas_limit: null,
			msg
		});
		return this;
	}

	addSubmessage(submsg: SubMsg): Response {
		this.messages.push(submsg);
		return this;
	}

	addAttribute(key: string, value: string): Response {
		this.attributes.push({key, value});
		return this;
	}

	addEvent(type: string, attributes: Attribute[]): Response {
		this.events.push({type, attributes});
		return this;
	}

	setData(data: Binary): Response {
		this.data = data;
		return this;
	}
}

@json
export class SubMsg {
	id: u64;
	msg: CosmosMsg;
	reply_on: string;
	gas_limit: Box<u64> | null = null;
}

export class Box<T> {
	value: T;

	constructor(value: T) {
		this.value = value;
	}

	__JSON_Serialize(): string {
		return JSON.stringify(this.value);
	}
}


export class Binary {
	value: string;

	constructor(value: string) {
		this.value = value;
	}

	__JSON_Serialize(): string {
		let stringifiedBzUtf8 = Uint8Array.wrap(String.UTF8.encode(this.value));
		return JSON.stringify(encode(stringifiedBzUtf8));
	}
}

export function to_binary<T>(value: T): Result<Binary, string> {
	return Result.Ok<Binary, string>(new Binary(JSON.stringify<T>(value)));
}

export function from_binary<T>(value: string): Result<T, string> {
	let bzB64 = decode(value);
	let bzUtf8 = String.UTF8.decode(bzB64.buffer);
	return Result.Ok<T, string>(JSON.parse<T>(bzUtf8));
}

export class Region {
	constructor(public ptr: u32, public offset: u32, public capacity: u32, public length: u32) {
	}

	public static fromPtr(ptr: usize): Region {
		let offset = load<u32>(ptr);
		let capacity = load<u32>(ptr + 4);
		let length = load<u32>(ptr + 8);
		return new Region(ptr, offset, capacity, length);
	}

	public static allocate(size: u32): Region {
		let regionPtr = allocate(size);
		return Region.fromPtr(regionPtr);
	}

	public static allocateAndWriteStr(str: string): Region {
		let region = Region.allocate(str.length);
		region.writeStr(str);
		return region;
	}

	public static allocateAndWrite(data: Uint8Array): Region {
		let region = Region.allocate(data.byteLength);
		region.write(data);
		return region;
	}

	write(data: Uint8Array): void {
		memory.copy(this.offset, data.dataStart, data.byteLength);
	}

	writeStr(str: string): void {
		let strBuffer = String.UTF8.encode(str, true);
		this.write(Uint8Array.wrap(strBuffer));
	}

	read(): Uint8Array {
		let buffer = new DataView(new ArrayBuffer(this.length));
		memory.copy(buffer.dataStart, this.offset, this.length);
		return Uint8Array.wrap(buffer.buffer);
	}

	readStr(): string {
		return String.UTF8.decode(this.read().buffer);
	}
}
