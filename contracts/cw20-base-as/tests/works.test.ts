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
		
		res = query(vm, env, { marketing_info: {} });
		expect(res).toMatchObject({
			project: '',
			description: '',
			logo: null,
			marketing: info1.sender,
		});
		
		res = query(vm, env, { minter: {} });
		expect(res).toMatchObject({
			minter: info1.sender,
		});
		
		vm.instantiate(env, info1, {
			minter: info2.sender,
			marketing: info2.sender,
			name: 'TestToken2',
			symbol: 'TT2',
			project: 'https://token2.test.fi',
			description: 'Our official second test token! Wooh!',
			decimals: 18,
		});
		
		res = query(vm, env, { token_info: {} });
		expect(res).toMatchObject({
			name: 'TestToken2',
			symbol: 'TT2',
			decimal: 18,
			total_supply: 0,
		});
		
		res = query(vm, env, { marketing_info: {} });
		expect(res).toMatchObject({
			project: 'https://token2.test.fi',
			description: 'Our official second test token! Wooh!',
			logo: null,
			marketing: info2.sender,
		});
		
		res = query(vm, env, { minter: {} });
		expect(res).toMatchObject({
			minter: 'bob',
		});
	});
	
	it("mints & burns", async () => {
		vm.instantiate(env, info1, token1);
		
		let res = vm.execute(env, info2, { mint: { recipient: info2.sender, amount: '10000' }});
		expect(res.json).toHaveProperty('error');
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		vm.execute(env, info1, { mint: { recipient: info2.sender, amount: '1000' }});
		vm.execute(env, info1, { burn: { amount: '1000' }});
		vm.execute(env, info2, { burn: { amount: '100' }});
		
		res = query(vm, env, { balance: { address: info1.sender }});
		expect(res).toMatchObject({
			balance: 9000,
		});
		
		res = query(vm, env, { balance: { address: info2.sender }});
		expect(res).toMatchObject({
			balance: 900,
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
		vm.execute(env, info1, { increase_allowance: { spender: info2.sender, amount: '1000' }});
		vm.execute(env, info2, { transfer_from: { owner: info1.sender, recipient: info2.sender, amount: '500' }});
		
		let res = query(vm, env, { allowance: { owner: info1.sender, spender: info2.sender }});
		expect(res).toMatchObject({
			amount: 500,
			expires: {
				never: {},
			},
		});
		
		res = query(vm, env, { balance: { address: info1.sender }});
		expect(res).toMatchObject({
			balance: 9500,
		});
		
		res = query(vm, env, { balance: { address: info2.sender }});
		expect(res).toMatchObject({
			balance: 500,
		});
	});
	
	it("fails exceeding allowance", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		vm.execute(env, info1, { increase_allowance: { spender: info2.sender, amount: '1000' }});
		let res = vm.execute(env, info2, { transfer_from: { owner: info1.sender, recipient: info2.sender, amount: '1100' }});
		expect(res.json).toHaveProperty('error');
	});
	
	// TODO: CWSimulate currently does not increase block height, so it's always at height 1, causing this to fail
	it.skip("allowance expires", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { mint: { recipient: info1.sender, amount: '10000' }});
		vm.execute(env, info1, { increase_allowance: { spender: info2.sender, amount: '1000', expires: { at_height: 1 }}});
		let res = vm.execute(env, info2, { transfer_from: { owner: info1.sender, recipient: info2.sender, amount: '1000' }});
		expect(res.json).toHaveProperty('error');
	});
	
	it("updates minter", async () => {
		vm.instantiate(env, info1, token1);
		
		let res = vm.execute(env, info2, { update_minter: { new_minter: info2.sender } });
		expect(res.json).toHaveProperty('error');
		
		vm.execute(env, info1, { update_minter: { new_minter: info2.sender } });
		
		res = query(vm, env, { minter: {} });
		expect(res).toMatchObject({
			minter: info2.sender
		});
	});
	
	it("updates marketing", async () => {
		vm.instantiate(env, info1, token1);
		
		let res = vm.execute(env, info2, { update_marketing: { project: 'foobar' }});
		expect(res.json).toHaveProperty('error');
		
		res = vm.execute(env, info1, { update_marketing: {
			project: 'https://testtoken.fi',
			marketing: info2.sender,
		}});
		console.log(res.json)
		
		res = query(vm, env, { marketing_info: {} });
		expect(res).toMatchObject({
			project: 'https://testtoken.fi',
			description: '',
			logo: null,
			marketing: info2.sender,
		});
		
		vm.execute(env, info2, { update_marketing: {
			description: 'Official TestToken Project',
		}});
		
		res = query(vm, env, { marketing_info: {} });
		expect(res).toMatchObject({
			project: 'https://testtoken.fi',
			description: 'Official TestToken Project',
			logo: null,
			marketing: info2.sender,
		});
	});
	
	it("uploads url logo", async () => {
		vm.instantiate(env, info1, token1);
		
		vm.execute(env, info1, { upload_logo: { url: 'https://test2.token.fi/logo.png' }});
		let res = vm.execute(env, info2, { upload_logo: { url: 'hijacked' }});
		expect(res.json).toHaveProperty('error');
		
		res = query(vm, env, { marketing_info: {} });
		expect(res).toMatchObject({
			logo: { url: 'https://test2.token.fi/logo.png' },
		});
	});
	
	it.todo("uploads embedded logo");
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
