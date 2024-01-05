import mustache from 'mustache';

class AgentsManager {
  constructor(request, functionName, path, agentsList) {
    this.request = request;
    this.functionName = functionName;
    this.path = path;
    this.currentAgent = 0;
    this.agents = agentsList;
  }

  getNextUrl() {
    if (this.currentAgent >= this.agents.length) return undefined;
    const pattern = this.agents[this.currentAgent];
    this.currentAgent++;
    const options = {
      request: this.request,
      function: this.functionName,
      path: this.path
    };
    const url = mustache.render(pattern, options);
    console.log("URL!!!", url);
    return url;
  }
}

export default AgentsManager;
