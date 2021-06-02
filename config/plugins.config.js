module.exports = [
  {
    // Create posts from markdown files
    use: '@gridsome/source-filesystem',
    options: {
      typeName: 'Post',
      baseDir: './content',
      path: ['./blogs/*.md', './poems/*.md', './abouts/*.md'],
      refs: {
        // Creates a GraphQL collection from 'tags' in front-matter and adds a reference.
        tags: {
          typeName: 'Tag',
          create: true,
        },
      },
      remark: {
        // remark options
        plugins: ["@gridsome/remark-prismjs"],
      },
    },
  },
  {
    use: "@gridsome/plugin-google-analytics",
    options: {
      id: "UA-158846445-1",
    },
  },
  {
    use: '@microflash/gridsome-plugin-feed',
    options: {
      // (required) Provide GraphQL collection types
      contentTypes: ['Post'],

      // (optional) Properties used by feed API
      // See https://github.com/jpmonette/feed#example for all options
      feedOptions: {
        title: '山风的Blog',
        description: '随便写写。',
      },

      // Available options with their default values

      // (optional) Options for feed formats
      // RSS is enabled by default
      rss: {
        enabled: true,
        output: '/feed.xml',
      },
      atom: {
        enabled: false,
        output: '/feed.atom',
      },
      json: {
        enabled: false,
        output: '/feed.json',
      },

      // (optional) number of items to include in a feed
      maxItems: 25,

      // (optional) an array of properties to be parsed as HTML
      // Converts relative URLs to absolute URLs
      // You can disable this by omitting the option
      htmlFields: ['content'],

      // (optional) appends a trailing slash to the URLs
      enforceTrailingSlashes: false,

      // (optional) a function to filter out the nodes
      // e.g., filter out all outdated posts, filterNodes: (node) => !!node.outdated
      filterNodes: (node) => node.published,

      // (optional) sets the properties on each feed item
      // See https://github.com/jpmonette/feed#example for all options
      nodeToFeedItem: (node) => ({
        title: node.title,
        date: node.date,
        description: node.description,
      }),
    },
  },
];
