<template>
  <div class="site-info">
    <g-image
      alt="site avatar"
      class="site-info__avatar"
      src="~/assets/images/avatar.jpg"
      width="180"
      height="180"
      blur="5"
    />

    <h1 class="site-info__name">
      {{ $static.metadata.my.name }}
      <span class="site-info__id">@{{ $static.metadata.my.id }}</span>
    </h1>
    <p class="site-info__bio">{{ $static.metadata.my.bio }}</p>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
    my {
      name
      id
      bio
    }
  }
}
</static-query>

<script>
export default {};
</script>

<style lang="scss">
.site-info {
  &__avatar {
    border-radius: 100%;
    max-width: 8em;
    margin-bottom: 0.75em;
  }

  &__name {
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }

  &__id {
    font-size: 0.75em;
  }

  &__bio {
    color: var(--body-color);
    margin-bottom: 0;
  }
}
</style>
