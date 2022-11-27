import { JSON } from "json-as/assembly";

@json
export class InstantiateMsg {
	count: i32
}

@json
export class IncrementBody {}

@json
export class ResetBody {
	count: i32
}

@json
export class ExecuteMsg {
	increment: IncrementBody | null;
	reset: ResetBody | null;
}

@json
export class GetCountBody {}

@json
export class QueryMsg {
	get_count: GetCountBody | null;
}


@json
export class CountResponse {
	count: i32;
}
