import { fromBase64, fromUtf8 } from "@cosmjs/encoding";
import {
	VMInstance,
	IBackend,
	BasicBackendApi,
	BasicKVIterStorage,
	BasicQuerier,
} from "@terran-one/cosmwasm-vm-js";
import {Env} from "@terran-one/cosmwasm-vm-js/dist/types";
import {readFileSync} from "fs";

let wasm: Buffer;
let storage: BasicKVIterStorage;
let backend: IBackend;
let vm: VMInstance;
let env: Env;

const info1 = { sender: 'alice', funds: [] };
const info2 = { sender: 'bob', funds: [] };

const token1 = {
	name: 'TestToken1',
	symbol: 'TT1',
	decimals: 6,
};

describe("cw20-base-as", () => {
	beforeEach(async () => {
		wasm = readFileSync(__dirname + "/../build/debug.wasm");
		storage = new BasicKVIterStorage();
		backend = {
			backend_api: new BasicBackendApi("terra"),
			storage,
			querier: new BasicQuerier(),
		};
		vm = new VMInstance(backend);
		await vm.build(wasm);


		env = {
			"block": {"height": 2868163, "time": "1669260984649833191", "chain_id": "pisco-1"},
			"contract": {"address": "terra1evndrg98clcjjgdpcq4tch57fvgqe2yu2u5ehgxvxtzcrkad37lspdler0"}
		};
	});

	it("instantiates", async () => {
		vm.instantiate(env, info1, token1);
		
		let res = query(vm, env, { token_info: {} });
		expect(res).toMatchObject({
			name: 'TestToken1',
			symbol: 'TT1',
			decimal: 6,
			total_supply: 0,
		});
		
		res = query(vm, env, { minter: {} });
		expect(res).toMatchObject({
			minter: info1.sender,
		});
		
		vm.instantiate(env, info1, {
			minter: 'bob',
			marketing: 'bob',
			name: 'TestToken2',
			symbol: 'TT2',
			decimals: 18,
		});
		
		res = query(vm, env, { token_info: {} });
		expect(res).toMatchObject({
			name: 'TestToken2',
			symbol: 'TT2',
			decimal: 18,
			total_supply: 0,
		});
		
		res = query(vm, env, { minter: {} });
		expect(res).toMatchObject({
			minter: 'bob',
		});
	});
	
	it("mints & burns", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		vm.execute(env, info1, { burn: { amount: '1000' }});
		
		let res = query(vm, env, { balance: { address: info1.sender }});
		expect(res).toMatchObject({
			balance: 9000,
		});
	});
	
	it("enforces mint authority", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info2, { mint: { recipient: info2.sender, amount: '10000' }});
		
		let res = query(vm, env, { balance: { address: info2.sender }});
		expect(res).toMatchObject({
			balance: 0,
		});
	});
	
	it("transfers", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		vm.execute(env, info1, { transfer: { recipient: info2.sender, amount: '1000' }});
		
		let res = query(vm, env, { balance: { address: info1.sender }});
		expect(res).toMatchObject({
			balance: 9000,
		});
		
		res = query(vm, env, { balance: { address: info2.sender }});
		expect(res).toMatchObject({
			balance: 1000,
		});
	});
	
	// can't really test this without a receiver contract...
	it.todo("sends");
	
	it("allowances", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		let res = vm.execute(env, info1, { increase_allowance: { spender: info2.sender, amount: '1000' }});
		console.log(getStore(vm))
		console.log(vm.debugMsgs)
		console.log(res.json)
		vm.execute(env, info2, { transfer_from: { owner: info1.sender, recipient: info2.sender, amount: '500' }});
		
		res = query(vm, env, { allowance: { owner: info1.sender, spender: info2.sender }});
		expect(res).toMatchObject({
			amount: 500,
			expires: {
				never: {},
			},
		});
	});
	
	it.todo("allowance expires");
});

function query(vm: VMInstance, env: Env, msg: any) {
	const res = vm.query(env, msg);
	const json = res.json as any;
	if ('ok' in json) {
		return JSON.parse(fromUtf8(fromBase64(json.ok)));
	} else {
		throw new Error(json.err);
	}
}

function getStore(vm: VMInstance) {
	return vm.backend.storage.dict.mapEntries(([key, value]) => [decode(key), decode(value)]).toObject();
}

const decode = (b64: string) => fromUtf8(fromBase64(b64));
