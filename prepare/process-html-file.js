import path from 'node:path';

import fs from 'fs-extra';
import { parse as parseHtml } from 'node-html-parser';

import saveWithHashName from "./save-with-hash-name.js";
import getMimeTypeOfRef from "./get-mime-type-of-ref.js";
import files from "./files-list.js";
import processFile from "./process-file.js";
import isWellFormedHashNetUrl from "./utils/is-well-formed-hash-net-url.js";
import getNonce from "./utils/get-nonce.js";
import getLabel from "./utils/get-label.js";
import getSignedMessage from "./utils/get-signed-message.js";

const getAttributeHandler = (attributeName, currentPath, srcPath, nonces, destPath, privateKey) => async (element) => {
  try {
    const src = element.getAttribute(attributeName);
    // TODO relative urls
    const url = new URL(src);
    // if url is relative - we have to process it (taking in accaunt base url value
    if (!["hash:", "signed:"].includes(url.protocol)) return;
    if (url.protocol === "hash:") {
      if (isWellFormedHashNetUrl(url)) return;
      const localPath = path.resolve(path.join(srcPath, url.pathname.substring(1)));
      const hashFunc = url.hostname;
      const mimeType = getMimeTypeOfRef(element, attributeName, localPath);
      const digest = await processFile(localPath, mimeType, hashFunc, nonces, srcPath, destPath, privateKey);
      url.pathname = `/${digest}`;
      element.setAttribute(attributeName, url.toString());
    }
    if (url.protocol === "signed:") {
      if (!privateKey.initialized) {
        console.log(`private key not initialized`);
        return;
      }
 
      if (!(privateKey.isDoableSignedUrl(url))) return;

      const localPath = path.join(srcPath, ...url.pathname.split("/").slice(2));
      // and here we have to get private key, derive public key, ensure than we are dealing with our url,
      // get nonce, increment it, sign message, save message, save new nonce
      
      const mimeType = getMimeTypeOfRef(element, attributeName, localPath);
      const hashFunc = url.hostname.split(".")[1] || privateKey.getPublicKey().split(":")[0].split(".")[1]; // TODO!!!
      // TODO CHECK IF WE ALREADY HAVE PROCESSED THE FILE
      const digest = await processFile(localPath, mimeType, hashFunc, nonces, srcPath, destPath, privateKey);
      const hash = `${hashFunc}:${digest}`;
      const nonce = getNonce(privateKey.getPublicKey(), url, hash, nonces);
      if (nonce !== undefined) {
        const label = getLabel(url);
 
        const messageToSave = await getSignedMessage(privateKey, hash, label, nonce);
        const pathToSave = path.join(destPath, "signed", hashFunc, digest);
        fs.outputJson(pathToSave, messageToSave, { spaces: 2 });
      }
      console.log(privateKey.getPublicKey());
      const [hostname, keyHexValue] = privateKey.getPublicKey().split(":");
      const chunks = url.pathname.split("/");
      chunks[1] = keyHexValue;
      element.setAttribute(attributeName, `signed://${hostname}${chunks.join("/")}`);
    }
  } catch {}
};

const processHtmlFile = (filePath, _hashFunc, nonces, srcPath, destPath, privateKey) => {
  const hashFunc = _hashFunc || privateKey.getPublicKey().split(":")[0].split(".")[1];
  const attributes = ["src", "href"];

  files[filePath]["text/html"][hashFunc] = new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const root = parseHtml(fileContent);
    const promises = attributes.map(attributeName => {
      const elements = root.querySelectorAll(`[${attributeName}]`);
      const attributeHandler = getAttributeHandler(attributeName, filePath, srcPath, nonces, destPath, privateKey);
      return elements.map(attributeHandler);
    });
    // TODO process inline styles && style tags
    Promise
      .all(promises.flat())
      .then((digests) => {
        const digest = saveWithHashName(root.toString(), hashFunc, destPath);
        console.log(`${filePath} => ${digest}`);
        resolve(digest);
      });
  });
  return files[filePath]["text/html"][hashFunc]
};

export default processHtmlFile;
