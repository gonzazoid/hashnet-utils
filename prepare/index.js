import path from 'node:path';
import url from 'node:url';

import fs from 'fs-extra';
import { glob } from 'glob';

import {
  createHash,
} from 'node:crypto';

import PrivateKey from "./private-key.js";
import files from "./files-list.js";
import processFile from "./process-file.js";
import getNonce from "./utils/get-nonce.js";
import getSignedMessage from "./utils/get-signed-message.js";

const prepare = async (options) => {
  const destPath = path.isAbsolute(options.dest) ? options.dest : path.resolve(path.join("./", options.dest));
  const srcPath = path.isAbsolute(options.src) ? options.src : path.resolve(path.join("./", options.src));

  const defaultHash = options["default-hash"];
  const entryPoints = options["entry-point"].map(relativePath => path.join(srcPath, relativePath));

  const privateKey = new PrivateKey(options.pkey);
  const getNonces = () => {
    if (!options.nonces) return {};
    try {
      return fs.readJson(options.nonces).catch(() => ({}));
    } catch {}
    return {};
  };

  const nonces = await getNonces();

  const filesPaths = await glob(`${srcPath}/**/*`, { nodir: true });
  console.log(filesPaths);
  filesPaths.forEach(filePath => files[filePath] = null);
  const entryFiles = entryPoints.filter(path => filesPaths.includes(path));
  await fs.emptyDir(path.join(destPath));

  const digests = [];
  for (const currentPath of entryFiles) {
    digests.push(await processFile(currentPath, "text/html", defaultHash, nonces, srcPath, destPath, privateKey));
  };

  const pairs = digests.map((digest, i) => [`${defaultHash}:${digest}`, entryFiles[i].substring(srcPath.length)]);
  console.table(pairs);

  await Promise.all(pairs.map(async ([hash, label]) => {
    const domainAndKeyValue = privateKey.getPublicKey().split(":").join("/");
    const url = new URL(`signed://${domainAndKeyValue}${label}`);
    const nonce = getNonce(privateKey.getPublicKey(), url, hash, nonces);
    if (nonce === undefined) return; // hash doesn't change, do nothing OR may be create message wthout incrementring nonce? TODO

    const messageToSave = await getSignedMessage(privateKey, hash, label, nonce);
    const [hashFunc, hashValue] = hash.split(":");
    const pathToSave = path.join(destPath, "signed", hashFunc, hashValue);
    fs.outputJson(pathToSave, messageToSave, { spaces: 2 });
  }));

  const unprocessedFiles = Object.keys(files).filter(key => !files[key]);
  if (unprocessedFiles.length) {
    console.log("these files were not processed (orphans or not modified):\n");
    console.table(unprocessedFiles);
  }
  if (options.nonces) {
    fs.outputJson(options.nonces, nonces, { spaces: 2 });
  }
};

export default prepare;
