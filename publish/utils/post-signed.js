import fetch, { fileFromSync } from 'node-fetch';

import AgentsManager from "./agents-manager.js";

const postSigned = async (filePath, agentsList) => {
  console.log("SIGNED MESSAGE!!!", filePath);
  const body = fileFromSync(filePath, 'application/json');
  const text = await body.text();
  try {
    const json = JSON.parse(text);
    const chunks = json.publicKey.split(":");
    const signFunction = chunks[0];
    const path = chunks[1];
    const agentsManager = new AgentsManager("signed", signFunction, path, agentsList);
    let success = false;
    do {
      const url = agentsManager.getNextUrl();
      if (!url) break; // TODO throw error
      const response = await fetch(url, { method: 'POST', body: text });
      if (response.status === 200) success = true;
      else console.log("STATUS!!!", response.status);
    } while (!success);
  } catch {}
};

export default postSigned;
