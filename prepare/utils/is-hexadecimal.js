const isHexadecimal = str => {
  try {
    return BigInt(`0x${str}`).toString(16).padStart(str.length, "0") === str; // url should be in lower case
  } catch {}
  return false;
};

export default isHexadecimal;
