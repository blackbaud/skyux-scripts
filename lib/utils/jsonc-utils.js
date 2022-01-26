const fs = require('fs-extra');
const commentJson = require('comment-json');
const prettier = require('prettier');

async function readJsonC(file) {
  const contents = (await fs.readFile(file)).toString();

  return commentJson.parse(contents);
}

async function writeJsonC(file, contents) {
  let contentsJson = commentJson.stringify(contents, undefined, 2);
  contentsJson = prettier.format(contentsJson, { parser: 'json' });

  // Some files like libraries' tsconfig.json files start with a block comment. The comment-json
  // library will move the starting curly brace to the end of the block comment, so this
  // will put it back on the next line, minimizing the number of diffs created in the file.
  if (contentsJson.startsWith('/*') && contentsJson.indexOf('*/ {') > 0) {
    // Be conservative and only replace the first occurrence of '*/ {' in case it appears
    // later in a property value.
    contentsJson = contentsJson.replace('*/ {', '*/\n{');
  }

  await fs.writeFile(file, contentsJson);
}

module.exports = {
  readJsonC,
  writeJsonC,
};
