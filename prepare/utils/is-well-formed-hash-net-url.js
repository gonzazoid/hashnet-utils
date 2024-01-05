import isHexadecimal from "./is-hexadecimal.js";

const isWellFormedHashNetUrl = url => {
  if (url.protocol === "hash:") {
    const chunks = url.pathname.split("/");
    if (chunks.length !== 2) return false;
    if (chunks[0] !== "") return false;
    return isHexadecimal(chunks[1]);
  }

  if (url.protocol === "signed:") {
    const chunks = url.pathname.split("/");
    if (chunks.length < 3) return false;
    if (chunks[0] !== "") return false;
    return isHexadecimal(chunks[1]);
  }

  return false;
};

export default isWellFormedHashNetUrl;
