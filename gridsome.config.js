// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config
const metadata = require('./config/metadata.config');
const plugins = require('./config/plugins.config');

module.exports = {
  siteName: '山风',
  siteDescription: "山风的小角落 / Ceynri's personal website",
  siteUrl: 'https://ceynri.cn',
  titleTemplate: '%s | 山风',
  templates: {
    Post: '/blog/:slug',
    Tag: '/blog/tag/:id',
    SinglePage: '/:slug',
  },
  metadata,
  plugins,
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "~/assets/styles/_mixin.scss";`,
      },
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader')
      .options({
        /* ... */
      });
  },
};
