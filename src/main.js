import store from '~/utils/store';

import '~/styles/index.scss';

import DefaultLayout from '~/layouts/Default.vue';
import PostLayout from '~/layouts/Post.vue';

// The Client API can be used here.
// Learn more: https://gridsome.org/docs/client-api
export default function(Vue, { appOptions, head }) {
  // Set layout as a global component
  Vue.component('Layout', DefaultLayout);
  Vue.component('PostLayout', PostLayout);

  appOptions.store = store;

  head.htmlAttrs = {
    lang: 'zh_CN',
  };
  head.meta.push({
    name: 'keywords',
    content: '山风,博客,个人网站,开发者,前端,ceynri,blog,developer,frontend',
  });

  // umami
  head.script.push({
    src: 'https://cloud.umami.is/script.js',
    async: true,
    defer: true,
    'data-website-id': '3f5aac97-7561-4a4a-8649-9c929a18841f',
  });
}
