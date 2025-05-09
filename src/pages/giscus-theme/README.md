# Giscus Themes

These files provide custom theme styles for the Giscus comment system:

- `dark.css.ts` - Dark theme style
- `light.css.ts` - Light theme style

## Usage

These styles are automatically applied to the Giscus comment system. In the `comments.astro` component, they are referenced as follows:

```ts
function getGiscusTheme() {
  const theme = document.documentElement.getAttribute('data-scheme') || 'light';
  const host = location.host;
  const path = theme === 'dark' ? '/giscus-theme/dark.css' : '/giscus-theme/light.css';
  return `//${host}${path}`;
}
```

## Style File Locations

The actual style definitions are in the following files:

- `src/styles/giscus/dark.scss` - Dark theme source file
- `src/styles/giscus/light.scss` - Light theme source file
- `src/styles/giscus/common.scss` - Shared styles

## Theme Switching

When a user switches the website theme, the Giscus theme style is automatically updated via JavaScript.
