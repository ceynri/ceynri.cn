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
    border-radius: 99px;
    height: 40px;
    width: 40px;
    margin-right: 0.5em;
  }
}
</style>
