// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config
const metadata = require('./config/metadata.config');
const plugins = require('./config/plugins.config');

module.exports = {
  siteName: '山风',
  siteDescription: "山风的小角落 / Ceynri's personal website",
  siteUrl: 'https://ceynri.cn',
  titleTemplate: '%s',
  templates: {
    Post: '/blog/:slug',
    Tag: '/blog/tags/:id',
    SinglePage: '/:slug',
  },
  assetsDir: `assets_${Date.now()}`,
  metadata,
  plugins,
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~/styles/_mixin.scss";`,
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
