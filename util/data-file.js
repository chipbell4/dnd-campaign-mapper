const fs = require('fs');
const path = require('path');

const Markdown = require('markdown-it');
const slugReplacer = require('./slug-replacer');
const getNeighbors = require('./get-neighbors');

class DataFile {
  constructor(pathToFile) {
    this.path = pathToFile;

    if (!fs.existsSync(this.path)) {
      throw new Error(`Cannot create DataFile: ${pathToFile} does not exist`);
    }

    this.slug = path.basename(this.path);
    this.contents = fs.readFileSync(this.path, 'utf8');
    this.neighbors = [];
  }

  get url() {
    const id = path.basename(this.path, path.extname(this.path));
    const type = path.basename(path.dirname(this.path));
    return `/${type}/${id}`;
  }

  get title() {
    const lines = this.contents.split('\n');
    return lines[0].replace(/[^A-Za-z 0-9]/, '').trim();
  }

  get body() {
    const lines = this.contents.split('\n');
    return lines.slice(1).join('\n');
  }

  buildMarkup(slugMap) {
    const md = new Markdown();
    md.use(slugReplacer, { slugs: slugMap });
    return md.render(this.contents);
  }

  async getNeighbors(dataset) {
    const md = new Markdown();

    return new Promise((resolve) => {
      md.use(getNeighbors, {
        dataset,
        callback: resolve,
      });

      md.render(this.contents);
    });
  }
}

module.exports = DataFile;
