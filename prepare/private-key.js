import * as secp256k1 from "@noble/secp256k1";
import secp256r1 from "secp256r1";

import {
  createHash,
} from "node:crypto";

import isHexadecimal from "./utils/is-hexadecimal.js";

class PrivateKey {

  initialized = false;
  aliases = [
    ['secp256r1', 'prime256v1'],
    ['secp256k1']
  ];

  constructor(pkey) {
    if (!pkey) return;
    const [signFunction, hashFunction, hexValue] = pkey.split(/\.|:/);
    // check if supported
    if (!this.isSupportedSignFunction(signFunction)) {
      throw new Error(`unsupported sign function ${signFunction}`);
    }
    this.signFunction = signFunction;
    if (!this.isSupportedHashFunction(hashFunction)) {
      throw new Error(`unsupported hash function ${hashFunction}`);
    }
    this.keyValue = hexValue;
    this.hashFunction = hashFunction;
    this.initialized = true;
  }

  getPublicKey() {
    const buff = Buffer.from(this.keyValue, "hex");
    let publicKeyValue;
    if (this.signFunction === "secp256k1") {
      const uint8 = new Uint8Array(buff);
      publicKeyValue = Buffer.from(secp256k1.getPublicKey(uint8)).toString("hex");
    }
    if (['secp256r1', 'prime256v1'].includes(this.signFunction)) {
      publicKeyValue = secp256r1.publicKeyCreate(buff).toString("hex");
    }

    if (!publicKeyValue) throw new Error();

    return `${this.signFunction}.${this.hashFunction}:${publicKeyValue}`;
  }

  getPublicKeyFromUrl(url) {
    const [,publicKeyValue] = url.pathname.split("/");
    return `${url.hostname}:${publicKeyValue}`;
  }

  isDoableSignedUrl(url) {
    const chunks = url.pathname.split("/");
    if (chunks.length < 3) return false;
    if (chunks[0] !== "") return false;
    if (chunks[1] === "*") return true;
    if (!isHexadecimal(chunks[1])) return false;;

    const publicKey = this.getPublicKey();
    const publicKeyFromUrl = this.getPublicKeyFromUrl(url);
    return publicKey === publicKeyFromUrl;
  }

  isSupportedSignFunction(signFunction) {
    const index = this.aliases.findIndex(set => set.includes(signFunction));
    return index !== -1;
  }

  isValidKeyValue(signFunction, hexValue) {

  }

  isSupportedHashFunction(hashFunction) {
    try {
      const hash = createHash(hashFunction);
      return true;
    } catch {}
    return false;
  }
  // TODO use asn1.js
  _makeDer(signature) {
    // https://bitcoin.stackexchange.com/questions/92680/what-are-the-der-signature-and-sec-format
    const __rHex = signature.r.toString(16);
    const _rHex = __rHex.length % 2 === 0 ? __rHex : `0${__rHex}`;
      
    const __sHex = signature.s.toString(16);
    const _sHex = __sHex.length % 2 === 0 ? __sHex : `0${__sHex}`;

    const rHex = parseInt(_rHex.slice(0, 2), 16) > parseInt("7F", 16) ? `00${_rHex}` : _rHex;
    const sHex = parseInt(_sHex.slice(0, 2), 16) > parseInt("7F", 16) ? `00${_sHex}` : _sHex;

    const rLength = rHex.length / 2;
    const sLength = sHex.length / 2;

    const der = `30${(rLength + sLength + 4).toString(16)}02${rLength.toString(16)}${rHex}02${sLength.toString(16)}${sHex}`;
    return der;
  }

  async sign(message) {
    const hash = createHash(this.hashFunction);
    hash.update(message);
    if (this.signFunction === "secp256k1") {
      const digest = hash.digest('hex');
      const signature = await secp256k1.signAsync(digest, this.keyValue);
      return this._makeDer(signature);
    }
    if (['secp256r1', 'prime256v1'].includes(this.signFunction)) {
      const digest = hash.digest();
      const pretender = Buffer.from(this.keyValue, 'hex');
      const pkey = Buffer.concat([Buffer.alloc(32 - pretender.length, 0), pretender]);
      const signature = secp256r1.sign(digest, pkey);
      const r = signature.signature.subarray(0, 32);
      const s = signature.signature.subarray(32);
      return this._makeDer({ r: BigInt(`0x${r.toString('hex')}`), s: BigInt(`0x${s.toString('hex')}`) });
    }
  }
};

export default PrivateKey;
