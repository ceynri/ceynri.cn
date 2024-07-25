<template>
  <div class="return-bar" @click="goBack">
    ← go back
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/blog/';
      }
    },
  },
};
</script>

<style lang="scss">
.return-bar {
  width: 100%;
  padding: calc(var(--padding-width) / 2);
  display: inline-block;
  background: linear-gradient(150deg, var(--bg-content-color), transparent 50%);
  border-radius: var(--radius);
  display: flex;

  cursor: pointer;
  user-select: none;
}
</style>
