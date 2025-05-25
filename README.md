# ceynri.cn

<!-- [![deploy workflow](https://github.com/ceynri/ceynri.cn/actions/workflows/deploy-website.yml/badge.svg)](https://github.com/ceynri/ceynri.cn/actions/workflows/deploy-website.yml) -->

My personal website. Visit <https://ceynri.cn/> to explore.

![home](https://github.com/user-attachments/assets/c5ed9862-0739-4d79-84fd-2413eaee90d2)

## Overview

A modern, responsive personal website featuring blog and portfolio content.

### Key Features

- 🚀 Fast & modern with Astro
- 📱 Mobile responsive design
- ✨ Cool animation effect on homepage
- 📝 Blog with tags and archives
- 💬 Comments powered by Giscus

<!--
### Structure

<details>
<summary>Home - A fancy single-screen page.</summary>

![Home](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624279447155-home.png)

Home logo and impression image add perspective effect for fun:

![perspective](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624284710324-move.gif)

</details>

<details>
<summary>Blog - The main part of the website. Chinese attention.</summary>

![Blog](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624279421290-blog.png)

</details>

<details>
<summary>Archive - Posts archived by year.</summary>

![archive](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624279909009-archive.png)

</details>

<details>
<summary>About - About me, about name, about...</summary>

![about](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624279861902-about.png)

</details>

<details>
<summary>Tags - Posts aggregated according to the contained tags.</summary>

![tag](https://cdn.jsdelivr.net/gh/ceynri/assets@main/images/1624279924010-tag.png)

</details>

TODO: floating image effect
-->

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [TailwindCSS](https://tailwindcss.com/) + [SASS](https://sass-lang.com/) - Styling
- [Giscus](https://github.com/laymonage/giscus) - Comments system
- [ESLint](https://eslint.org/) ([@antfu/eslint-config](https://github.com/antfu/eslint-config)) - Code quality
- Built with [Cursor](https://www.cursor.com/) - AI-powered IDE
<!-- - [Github Action](https://github.com/ceynri/ceynri.cn/actions) -->

## Browser Support

- ✅ Modern browser supported.
- 📱 Mobile compatible.

> **Note**: If you encounter any bugs or issues, please feel free to [submit an issue](https://github.com/ceynri/ceynri.cn/issues).

## Version History

- **v3** (Current): Latest version built with Astro 🚀
- **v2**: Previous version based on [Gridsome](https://gridsome.org/). Migrated to Astro due to [Gridsome being a deprecated technology](https://github.com/gridsome/gridsome/issues/1684)
- **v1**: Legacy version archived in the [v1 branch](https://github.com/ceynri/ceynri.cn/tree/v1) (Chinese attention). Still accessible at <https://v1.ceynri.cn/>

---

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The development server will be available at `http://localhost:4321/`

### Build for Production

```bash
# Build the project
pnpm build

# Preview the build locally
pnpm preview
```

---

## License

[MIT © Ceynri](./LICENSE)
