import getLabel from "./get-label.js";

const getNonce = (public_key, url, hash, nonces) => {
  if (!nonces[public_key]) {
    nonces[public_key] = {};
  }
  const label = getLabel(url);
  if (nonces[public_key][label]) {
    if (nonces[public_key][label].hash === hash) return undefined;
    nonces[public_key][label] = { hash, nonce: `${parseInt(nonces[public_key][label].nonce, 10) + 1}` };
  } else {
    nonces[public_key][label] = { hash, nonce: "1" };
  }
  return nonces[public_key][label].nonce;
};

export default getNonce;
