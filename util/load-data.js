const enumerateData = require('./enumerate-data');

module.exports = function(directory) {
  return enumerateData(directory);
};
