#!/usr/bin/env node
const express = require('express');
const path = require('path');
const argv = require('yargs').argv;

// parse command-line args
const dataDirectory = path.resolve(argv.dataDirectory) || path.resolve('./data');
const port = Number(argv.port) || 3000;

const app = express();

const loadData = require('./util/load-data');

app.use(express.static('static'));
app.use(express.static('node_modules/pixi.js/dist'));

app.get('/:type/:id', (req, res) => {
  const dataset = loadData(dataDirectory);

  const slugMap = dataset.reduce((slugMap, entry) => {
    return Object.assign({
      [entry.dataFile.title]: entry.dataFile.url,
    }, slugMap);
  }, {});

  const entry = dataset.find((entry) => {
    return entry.id === req.params.id && entry.type === req.params.type;
  });

  if (!entry) {
    res.status(400).send('MISSING');
  } else {
    res.send(entry.dataFile.buildMarkup(slugMap));
  }
});

app.get('/graph.json', async (req, res) => {
  const dataset = loadData(dataDirectory);

  const graph = {};

  for (const item of dataset) {
    const neighbors = await item.dataFile.getNeighbors(dataset);
    graph[item.dataFile.title] = {
      link: item.dataFile.url,
      neighbors,
    };
  }

  res.send(graph);
});

console.log(`Server listening on port ${port}`);
app.listen(port);
