import path from 'node:path';
import url from 'node:url';

import fs from 'fs-extra';
import { glob } from 'glob';
import fetch, { fileFromSync } from 'node-fetch';

import postHash from "./utils/post-hash.js";
import postSigned from "./utils/post-signed.js";

const publish = async (options) => {
  const srcPath = path.isAbsolute(options.src) ? options.src : path.resolve(path.join("./", options.src));
  const agentsList = options.agent;

  const filesPaths = await glob(`${srcPath}/**/*`, { nodir: true });
  console.log("FILES!!!", filesPaths);
  for (const currentPath of filesPaths) {
    const localPath = currentPath.substring(srcPath.length);
    const chunks = localPath.split(path.sep);
    if (chunks[1] === "signed") {
      console.log("SIGNED MESSAGE!!!", localPath);
      await postSigned(currentPath, agentsList);
    } else {
      await postHash(currentPath, chunks[1], chunks[2], agentsList);
    }
  }
};

export default publish;
