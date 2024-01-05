import fs from 'fs-extra';

import processAsHtmlFile from "./process-html-file.js";
import saveWithHashName from "./save-with-hash-name.js";
import files from "./files-list.js";

const localFileExist = async (localPath) => {
  try {
    return (await fs.stat(localPath)).isFile();
  } catch {}
  return false;
};

const processAsPlainFile = (localPath, hashFunc, destPath) => {
  try {
    // TODO make async and use buffer
    const content = fs.readFileSync(localPath);
    const digest = saveWithHashName(content, hashFunc, destPath);
    return digest;
  } catch (e) {
    console.log("ERROR!!!!", e);
  }
};

const processAsCSSFile = (filePath, hashFunc, destPath) => {
  const content = fs.readFileSync(filePath);
  processCssContent(content, hashFunc);

  return processAsPlainFile(filePath, hashFunc, destPath)
};

const processCssContent = async (content, hashFunc) => {
  // COMING SOON...
};

const inProgress = [];

const processFile = async (filePath, _mimeType, hashFunc, nonces, srcPath, destPath, privateKey) => {
  const mimeType = _mimeType || getMimeTypeOfFile(filePath); 
  if (inProgress.includes(filePath)) {
    console.log("circular dependencies");
    process.exit(1);
  }

  if (!(filePath in files)) {
    console.log(`file ${filePath} not found in files list`);
    process.exit(1);
  }

  if (files?.[filePath]?.[mimeType]?.[hashFunc]) return files[filePath][mimeType][hashFunc];
  if (!(await localFileExist(filePath))) {
    console.log(`file ${filePath} not found in src dir`);
    process.exit(1);
  }

  if (!files[filePath]) {
    files[filePath] = {
      "text/html": null,
      "text/css": null,
      "application/octet-stream": null,
    }
  }
  if (!files[filePath][mimeType]) {
    files[filePath][mimeType] = {};
  }

  inProgress.push(filePath);
  let result;
  switch (mimeType) {
    case "text/html":
      result = processAsHtmlFile(filePath, hashFunc, nonces, srcPath, destPath, privateKey);
      break;
    case "text/css":
      result = processAsCSSFile(filePath, hashFunc, destPath)
      break;
    default:
      result = processAsPlainFile(filePath, hashFunc, destPath);
  }

  inProgress.pop();
  return result;
};

export default processFile;
