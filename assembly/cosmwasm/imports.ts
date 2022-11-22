@external("env", "db_read")
export declare function db_read(keyPtr: usize): usize;

@external("env", "db_write")
export declare function db_write(keyPtr: usize, valuePtr: usize): void;

@external("env", "db_remove")
export declare function db_remove(keyPtr: usize): void;
// export declare function db_scan(messagePtr: usize): void;
// export declare function db_next(messagePtr: usize): void;
// export declare function addr_humanize(sourcePtr: usize, destPtr: usize): usize;
// export declare function addr_canonicalize(sourcePtr: usize, destPtr: usize): usize;
// export declare function addr_validate(sourcePtr: usize): usize;
// export declare function secp256k1_verify(messagePtr: usize): void;
// export declare function secp256k1_recover_pubkey(messagePtr: usize): void;
// export declare function ed25519_verify(messagePtr: usize): void;
// export declare function ed25519_batch_verify(messagePtr: usize): void;
// export declare function debug(messagePtr: usize): void;
// export declare function query_chain(messagePtr: usize): void;
@external("env", "abort")
export declare function abort(messagePtr: usize): void;
