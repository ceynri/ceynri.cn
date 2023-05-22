import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const getColorScheme = () => {
  try {
    return localStorage.getItem('colorScheme');
  } catch (err) {
    // do nothing
  }
}

export default new Vuex.Store({
  state: {
    scheme: process.isClient ? getColorScheme() : 'dark',
  },
  mutations: {
    toggleColorScheme(state) {
      const isLight = getColorScheme() === 'light';
      const reverseColor = isLight ? 'dark' : 'light';
      window.__setColorScheme(reverseColor);
      state.scheme = reverseColor;
    },
  },
});
