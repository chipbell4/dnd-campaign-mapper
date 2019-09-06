const path = require('path');
const exec = require('child_process').execSync;

const DataFile = require('./data-file');

const ALLOWED_EXTENSIONS = [ '.md' ];

module.exports = function(directory) {
  if (!directory) {
    directory = path.join(path.dirname(__dirname), 'data');
  }

  const rawOutput = exec(`find ${directory} -type f`).toString('utf8').trim();
  const files = rawOutput.split('\n');

  return files
    .filter((src) => {
      return ALLOWED_EXTENSIONS.indexOf(path.extname(src)) > -1;
    })
    .map((src) => {
      const id = path.basename(src, path.extname(src));
      const type = path.basename(path.dirname(src));

      return {
        id,
        type,
        dataFile: new DataFile(src),
      };
    });
};
