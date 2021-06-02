// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config
const metadata = require('./config/metadata.config');
const plugins = require('./config/plugins.config');

module.exports = {
  siteName: 'Ceynri',
  siteDescription: "山风的个人网站 / Ceynri's personal website",
  siteUrl: 'https://ceynri.cn',
  templates: {
    Post: '/blog/:year/:month/:day/:slug',
    Tag: '/blog/tag/:id',
  },
  metadata,
  plugins,
  transformers: {
    // Add markdown support to all file-system sources
    remark: {
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      anchorClassName: 'icon icon-link',
    },
  },
};
