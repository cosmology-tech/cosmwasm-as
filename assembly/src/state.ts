import { JSON } from "json-as/assembly";
import {Item} from "../cosmwasm/cw-storage-plus";

@json
export class State {
	owner: string;
	count: i32;
}

export const STATE = new Item<State>("state");
