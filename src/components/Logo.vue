<template>
  <div class="logo">
    {{ $static.metadata.siteName }}
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<style lang="scss">
.logo {
  &__image {
    vertical-align: middle;
    border-radius: 50%;
    height: 100%;
    margin-right: 0.5em;
  }
}
</style>
