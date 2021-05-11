import '~/assets/style/index.scss';
import DefaultLayout from '~/layouts/Default.vue';
import Vuex from 'vuex';
import store from '~/store';

// The Client API can be used here. Learn more: gridsome.org/docs/client-api
export default function(Vue, { appOptions }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout);
  Vue.use(Vuex);
  appOptions.store = store;
}
