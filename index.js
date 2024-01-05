#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import prepare from "./prepare/index.js";
import publish from "./publish/index.js";

const optionDefinitions = [
  { name: 'command', defaultOption: true },
];

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });
const argv = options._unknown || []

if (options.command === "prepare") {
  const prepareDefinitions = [
    { name: 'dest', alias: 'd', type: String, defaultValue: "./hash-net-artefacts" },
    { name: 'src', alias: 's', type: String },
    { name: 'default-hash', type: String, defaultValue: "sha256" },
    { name: 'entry-point', type: String, multiple: true, defaultValue: ["index.html", "index.htm"] },
    { name: 'pkey', type: String },
    { name: 'nonces', type: String},
  ];
  const prepareOptions = commandLineArgs(prepareDefinitions, { argv });
  prepare(prepareOptions);
}

if (options.command === "publish") {
  const publishDefinitions = [
    { name: 'src', alias: 'd', type: String, defaultValue: "./hash-net-artefacts" },
    { name: 'agent', alias: 'a', type: String, multiple: true },
  ];
  const publishOptions = commandLineArgs(publishDefinitions, { argv });
  publish(publishOptions);
}
