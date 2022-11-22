@external("env", "abort")
export declare function abort(messagePtr: usize): void;

@external("env", "db_read")
export declare function db_read(keyPtr: usize): usize;
@external("env", "db_write")
export declare function db_write(keyPtr: usize, valuePtr: usize): void;
@external("env", "db_remove")
export declare function db_remove(keyPtr: usize): void;

// Iterator
@external("env", "db_scan")
export declare function db_scan(startPtr: usize, endPtr: usize, order: i32): usize;
@external("env", "db_next")
export declare function db_next(iteratorId: u32): usize;

// Addr
@external("env", "addr_validate")
export declare function addr_validate(sourcePtr: usize): usize;
@external("env", "addr_humanize")
export declare function addr_humanize(sourcePtr: usize, destPtr: usize): usize;
@external("env", "addr_canonicalize")
export declare function addr_canonicalize(sourcePtr: usize, destPtr: usize): usize;

@external("env", "sec256k1_verify")
export declare function secp256k1_verify(messageHashPtr: usize, signaturePtr: usize, publicKeyPtr: usize): u32;
@external("env", "secp256k1_recover_pubkey")
export declare function secp256k1_recover_pubkey(messageHashPtr: usize, signaturePtr: usize, recoveryParam: u32): u64;
@external("env", "ed25519_verify")
export declare function ed25519_verify(messagePtr: usize, signaturePtr: usize, publicKeyPtr: usize): usize;
@external("env", "ed25519_batch_verify")
export declare function ed25519_batch_verify(messagesPtr: usize, signaturesPtr: usize, publicKeysPtr: usize): usize;

@external("env", "debug")
export declare function debug(sourcePtr: usize): void;

@external("env", "query_chain")
export declare function query_chain(requestPtr: usize): u32;
