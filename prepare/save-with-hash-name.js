import { createHash } from 'node:crypto';
import path from 'node:path';

import fs from 'fs-extra';

const saveWithHashName = (content, hashFunc, destPath) => {
  // TODO use buffer and chunks
  const hash = createHash(hashFunc);
  const digest = hash.update(content)
                     .digest('hex');
  const pathToSave = path.join(destPath, hashFunc, digest);
  fs.outputFile(pathToSave, content);
  return digest;
};

export default saveWithHashName;
