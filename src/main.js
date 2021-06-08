import '~/assets/styles/index.scss';
import DefaultLayout from '~/layouts/Default.vue';
import PostLayout from '~/layouts/Post.vue';
import { SimpleSVG } from 'vue-simple-svg';
import Vuex from 'vuex';
import store from '~/store';

// The Client API can be used here. Learn more: gridsome.org/docs/client-api
export default function(Vue, { appOptions, head }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout);
  Vue.component('PostLayout', PostLayout);
  Vue.component('svg-icon', SimpleSVG);
  Vue.use(Vuex);
  appOptions.store = store;
  head.htmlAttrs = {
    lang: 'zh_CN',
  };
  head.meta.push({
    name: 'keywords',
    content: '山风,博客,前端,ceynri,frontend,blog',
  });
}
