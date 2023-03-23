# ceynri.cn

You can visit <https://ceynri.cn/> to experience.

> [Gridsome](https://github.com/Gridsome/Gridsome) looks like out of maintenance, so I am looking for a substitute for Gridsome later on. If you have a good recommendation, welcome to communicate with me! 😉

## Introduction

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

### Techology

ceynri.cn v2 is powered by [Gridsome](https://gridsome.org), which is a Vue-powered Static Site Generator inspired by [Gatsby](https://www.gatsbyjs.com/).

The comment system currently uses [giscus](https://github.com/laymonage/giscus), a plugin similar to [utterances](https://github.com/utterance/utterances) but uses discussions instead of issues.

Automatic update deployment via [Github Action](https://github.com/ceynri/ceynri.cn/actions).

### Compatibility

- 😅 All IE versions are not supported. Please use MODERN browser if you are using IE.
- 📱 Mobile is compatible.
- 🙏 If you meet bugs, please submit an [issue](https://github.com/ceynri/ceynri.cn/issues).

### Versions

**v2** is the version that is working now.

v1 project in git repo was archived at [v1](https://github.com/ceynri/ceynri.cn/tree/v1) branch (Chinese attention). You can still visit <https://v1.ceynri.cn/> to experience it.

---

## Development

### Local development

> Node.js 14x required

```sh
npm install
npm run dev
```

> GraphQL requires `content` folder with specific structure

Visit `http://localhost:8080/` for development.

### Build dist

```sh
npm run build
```

---

## License

[MIT © Ceynri](./LICENSE)
