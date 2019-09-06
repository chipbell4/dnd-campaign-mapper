class ColorPicker {
  constructor() {
    this.colors = [
      0x4c1d93,
      0x931d64,
      0x64931d,
      0x1d934c,
    ];

    this.colorIndex = 0;

    this.colorMap = {};
  }

  static get instance() {
    if (ColorPicker._instance === undefined) {
      ColorPicker._instance = new ColorPicker();
    }
    return ColorPicker._instance;
  }

  getColor(key) {
    if (! (key in this.colorMap) ) {
      this.colorMap[key] = this.colors[this.colorIndex];
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }

    return this.colorMap[key];
  }
}


class Node extends PIXI.Container {
  constructor(width, height, text, link) {
    super();

    // select background color based on subclass
    const subclass = link.split('/')[1];
    const color = ColorPicker.instance.getColor(subclass);

    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(color);
    this.graphics.drawRect(-width / 2, -height / 2, width, height);
    this.graphics.endFill();
    this.addChild(this.graphics);

    this.graphics.interactive = true;
    this.graphics.buttonMode = true;
    this.graphics.on('pointerdown', () => window.location = link);

    this.text = new PIXI.Text(text, new PIXI.TextStyle({
      fontSize: 11,
      fill: 0xffffff
    }));
    this.text.anchor.set(0.5, 0.5);
    this.text.position.set(0, 0);
    this.addChild(this.text);

    this.vx = 0;
    this.vy = 0;

    this.ax = 0;
    this.ay = 0;
  }

  applyLinkedForce(other) {
    const decay = 0.9;
    const springConstant = 1; // TODO: Pick a better number
    const restingLength = 100; // TODO: Pick a better number

    const dx = other.x - this.x;
    const dy = other.y - this.y;

    if (dx * dx + dy * dy > restingLength) {
      // spring is elongated and wants to contract
      this.ax += decay * dx * springConstant;
      this.ay += decay * dy * springConstant;
    } else {
      // spring is compressed and wants to expand
      this.ax -= decay * dx * springConstant;
      this.ay -= decay * dy * springConstant;
    }
  }
      
  applyRepelForce(other) {
    const G = 3000;
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const r = Math.sqrt(dx * dx + dy * dy);

    // apply a radial "push" away to keep distance
    const magnitude = G / (r * r);

    this.ax -= magnitude * dx;
    this.ay -= magnitude * dy;
  }

  applyAttractionPoint(x, y) {
    const springConstant = 0.1;
    this.ax = (x - this.x) * springConstant
    this.ay = (y - this.y) * springConstant
  }

  exertForce(dt) {
    this.vx += dt * this.ax;
    this.vy += dt * this.ay;

    this.x += dt * this.vx;
    this.y += dt * this.vy;

    // reset applied force
    this.ax = 0;
    this.ay = 0;

    // decay speed a tad
    this.vx *= 0.99;
    this.vy *= 0.99;
  }
}

const app = new PIXI.Application();

document.body.appendChild(app.view);

const nodes = [];

window.fetch('/graph.json')
  .then(r => r.json())
  .then(graph => {
    const edges = new PIXI.Graphics();
    app.stage.addChild(edges);

    const nodes = {};
    
    const nodeNames = Object.keys(graph);

    // sort node names by number of neighbors first and then by name
    nodeNames.sort((n1, n2) => {
      if (graph[n1].neighbors.length === graph[n2].neighbors.length) {
        return n1 < n2 ? -1 : 1;
      }

      return graph[n2].neighbors.length - graph[n1].neighbors.length;
    });

    const areNeighbors = (n1, n2) => {
      return graph[n1].neighbors.indexOf(n2) > -1 ||
        graph[n2].neighbors.indexOf(n1) > -1;
    };

    for (let i = 0; i < nodeNames.length; i++) {
      const thing = nodeNames[i];
      nodes[thing] = new Node(100, 30, thing, graph[thing].link);
      app.stage.addChild(nodes[thing]);

      const radius = i / nodeNames.length * 600;
      const theta = i * Math.PI / 8;
      nodes[thing].x = 400 + radius * Math.cos(theta);
      nodes[thing].y = 300 + radius * Math.sin(theta);
    };

    const step = () => {
      for (let n1 of nodeNames) {
        nodes[n1].applyAttractionPoint(400, 300);

        for (let n2 of nodeNames) {
          if (n1 === n2) {
            continue;
          } else if (areNeighbors(n1, n2)) {
            nodes[n1].applyLinkedForce(nodes[n2]);
          } else {
            nodes[n1].applyRepelForce(nodes[n2]);
          }
        }
      }
      
      for (let n1 of nodeNames) {
        nodes[n1].exertForce(1 / 60);
      }
    };

    const drawEdges = () => {
      edges.clear();
      edges.lineStyle(2, 0xFFFFFF, 1);
      for (let n1 of nodeNames) {
        for (let n2 of nodeNames) {
          if (areNeighbors(n1, n2)) {
            edges.moveTo(nodes[n1].x, nodes[n1].y);
            edges.lineTo(nodes[n2].x, nodes[n2].y);
          }
        }
      }
    };

    const PRESTEP_COUNT = 20;
    const POSTSTEP_COUNT = 2000;

    // prestep a bit for stability
    for (let i = 0; i < PRESTEP_COUNT; i++) {
      step();
    }

    drawEdges();

    let stepsRemaining = POSTSTEP_COUNT;
    app.ticker.add(() => {
      if (stepsRemaining <= 0) {
        return;
      }

      step();
      drawEdges();
      stepsRemaining--;
    });

    // draw a list with all of the nodes on it
    const makeListItem = (name) => {
      return `
        <li>
          <a href="${graph[name].link}">${name}</a>
          (${graph[name].neighbors.length} neighbors)
        </li>
        `;
    };

    const ul = document.createElement('ul');
    const names = Object.keys(graph);
    names.sort();
    ul.innerHTML = names.map(makeListItem).join('\n');
    document.body.appendChild(ul);
  });

