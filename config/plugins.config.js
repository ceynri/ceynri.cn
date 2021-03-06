module.exports = [
  {
    // Create posts from markdown files
    use: '@gridsome/source-filesystem',
    options: {
      typeName: 'Post',
      baseDir: './content',
      path: ['./blogs/**/*.md', './poems/**/*.md'],
      refs: {
        // Creates a GraphQL collection from 'tags' in front-matter and adds a reference.
        tags: {
          typeName: 'Tag',
          create: true,
        },
      },
      remark: {
        // code highlight
        plugins: ['@gridsome/remark-prismjs'],
        imageQuality: 95,
        imageBlurRatio: 10,
        // lazyLoadImages: false,
      },
    },
  },
  {
    // Create pages from markdown files
    use: '@gridsome/source-filesystem',
    options: {
      typeName: 'SinglePage',
      baseDir: './content',
      path: ['./pages/*.md'],
      remark: {
        // code highlight
        plugins: ['@gridsome/remark-prismjs'],
        imageQuality: 95,
        imageBlurRatio: 10,
      },
    },
  },
  {
    use: '@gridsome/plugin-google-analytics',
    options: {
      id: 'UA-158846445-1',
    },
  },
  {
    use: '@microflash/gridsome-plugin-feed',
    options: {
      contentTypes: ['Post'],
      feedOptions: {
        title: '山风的小角落',
        description: '随便写写。',
      },
      rss: {
        enabled: true,
        output: '/feed.xml',
      },
      maxItems: 16,
      // (optional) an array of properties to be parsed as HTML
      // Converts relative URLs to absolute URLs
      // You can disable this by omitting the option
      htmlFields: ['content'],
      enforceTrailingSlashes: false,
      filterNodes: (node) => node.published,
      // See https://github.com/jpmonette/feed#example for all options
      nodeToFeedItem: (node) => ({
        title: node.title,
        date: node.date,
        description: node.description,
      }),
    },
  },
];
