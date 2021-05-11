import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    theme: 'dark',
  },
  mutations: {
    setTheme(state, value) {
      state.theme = value;
      // This is using a script that is added in index.html
      window.__setPreferredTheme(value);
    },
  },
  actions: {},
  modules: {},
});
