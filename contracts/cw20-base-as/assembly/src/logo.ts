import { Binary } from '@cosmwasm-as/std';
import { JSON } from 'json-as';

@json
export class LogoInfoEmbedded {}

@json
export class LogoInfo {
  url: string | null;
  embedded: LogoInfoEmbedded | null;
}

@json
export class EmbeddedLogo {
  svg: Binary | null;
  png: Binary | null;
}

@json
export class Logo {
  url: string | null;
  embedded: EmbeddedLogo | null;
}
