import {VMInstance, IBackend, BasicBackendApi, BasicKVIterStorage, BasicQuerier} from "@terran-one/cosmwasm-vm-js";
import { readFileSync } from "fs";
import {Env} from "@terran-one/cosmwasm-vm-js/dist/types";

let wasm: Buffer;
let storage: BasicKVIterStorage;
let backend: IBackend;
let vm: VMInstance;
let env: Env;

describe("cw-as", () => {
	beforeEach( async () => {
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
			block: {
				time: 0,
				height: "10000000000000",
				chain_id: 'terra'
			},
			contract: {
				address: 'contract'
			},
			transaction: {
				index: 0
			}
		};

	});

	it('works', async () => {
		let info1 = { sender: "A", funds: []};
		let info2 = { sender: "B", funds: []};

		let res =	vm.instantiate(env, info1, {count: 0});
		res = vm.execute(env, info1, {increment:{}});
		console.log(res.json);
		res = vm.execute(env, info1, {increment:{}});
		console.log(res.json);
		res = vm.execute(env, info1, {reset:{}});
		console.log(res.json);
		res = vm.execute(env, info1, {increment:{}});
		console.log(res.json);
		res = vm.execute(env, info1, {increment:{}});
		console.log(res.json);
		res = vm.query(env, {get_count:{}});

		let parsedRes = Buffer.from(res.str, 'base64').toString();
		console.log(parsedRes);
	})
})
