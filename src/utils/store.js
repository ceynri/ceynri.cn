import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    scheme: window.__colorScheme,
  },
  mutations: {
    toggleColorScheme(state) {
      const isLight = window.__colorScheme === 'light';
      const reverseColor = isLight ? 'dark' : 'light';
      window.__setColorScheme(reverseColor);
      state.scheme = reverseColor;
    },
  },
});
