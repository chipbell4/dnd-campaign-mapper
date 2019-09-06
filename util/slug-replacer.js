const splitChild = (token, childIndex, slug, url) => {
  const content = token.children[childIndex].content;
  const slugStart = content.indexOf(slug);
  const slugEnd = slugStart + slug.length;

  const newChildren = [
    {
      type: 'text',
      content: content.substring(0, slugStart),
    },
    {
      type: 'link_open',
      tag: 'a',
      attrs: [ [ 'href', url ] ],
      nesting: 1,
      content: null,
    },
    {
      type: 'text',
      content: slug,
    },
    {
      type: 'link_close',
      tag: 'a',
      nesting: -1,
      content: null,
    },
    {
      type: 'text',
      content: content.substring(slugEnd),
    },
  ];

  const args = [ childIndex, 1 ].concat(newChildren);
  Array.prototype.splice.apply(token.children, args);
};

module.exports = (md, options) => {
  // if no slugs are configured, bail
  if (options.slugs === undefined) {
    return;
  }

  md.core.ruler.push('slug-replacer', (state) => {
    state.tokens
      .filter((token) => token.type === 'inline')
      .forEach((token) => {
        for (let i = 0; i < token.children.length; i++) {
          const child = token.children[i];

          if (child.type !== 'text') {
            continue;
          }

          const matchingSlugs = Object.keys(options.slugs)
            .filter((slug) => child.content.indexOf(slug) > -1);
          matchingSlugs.sort((a, b) => {
            const indexA = child.content.indexOf(a);
            const indexB = child.content.indexOf(b);
            return indexA - indexB;
          });

          matchingSlugs.forEach((slug) => {
            const url = options.slugs[slug];

            if (child.content.indexOf(slug) > -1) {
              splitChild(token, i, slug, url);
              i += 4;
            }
          });
        }
      });
  });
};
