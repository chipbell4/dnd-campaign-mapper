module.exports = (md, options) => {
  if (options.dataset === undefined || options.callback === undefined) {
    return;
  }

  md.core.ruler.push('neighbor-getter', (state) => {
    const neighbors = new Set();

    state.tokens
      .filter((token) => token.type === 'inline')
      .forEach((token) => {
        for (let i = 0; i < token.children.length; i++) {
          const child = token.children[i];

          if (child.type !== 'text') {
            continue;
          }

          options.dataset.forEach((entry) => {
            const dataFile = entry.dataFile;

            if (child.content.indexOf(dataFile.title) > -1) {
              neighbors.add(dataFile.title);
            }
          });
        }
      });

    options.callback(Array.from(neighbors));
  });
};
