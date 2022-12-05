import { Env } from '@cosmwasm-as/std';
import { Result } from 'as-container';
import { JSON } from 'json-as';

@json
export class ExpiresNever {}

@json
export class Expiration {
  // treat 0 specially
  at_height: u64;
  at_time: u64;
  never: ExpiresNever | null;
  
  isExpired(env: Env): Result<bool, string> {
    if (this.at_height > 0) {
      return Result.Ok<bool, string>(env.block.height < this.at_height);
    } else if (this.at_time > 0) {
      // TODO: implement once we have a solution in @cosmwasm-as/std
      return Result.Err<bool, string>("Needs @cosmwasm-as/std support");
    } else {
      return Result.Ok<bool, string>(false);
    }
  }
  
  static default(): Expiration {
    const exp = new Expiration();
    exp.at_height = 0;
    exp.at_time = 0;
    exp.never = {};
    return exp;
  }
}
