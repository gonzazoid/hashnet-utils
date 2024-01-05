import fetch, { fileFromSync } from 'node-fetch';

import AgentsManager from "./agents-manager.js";

const postHash = async (filePath, hashFunction, hashValue, agentsList) => {
  console.log("HASH MESSAGE!!!", filePath, hashFunction, hashValue);
  const body = fileFromSync(filePath, 'application/octet-stream');
  const agentsManager = new AgentsManager("hash", hashFunction, hashValue, agentsList);
  let success = false;
  do {
    const url = agentsManager.getNextUrl();
    if (!url) break; // TODO throw error
    const response = await fetch(url, { method: 'POST', body });
    if (response.status === 200) success = true;
  } while (!success);
};

export default postHash;
