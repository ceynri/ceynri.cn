/**
 * Finds all link DOM
 * @param parentDom element which limits the search scope
 * @returns link DOM array
 */
export const findAllLinkDom = (parentDom = document) => {
  const linkDoms = parentDom.querySelectorAll('a');
  return [...linkDoms].map((linkDom) => {
    if (!linkDom.href) {
      return;
    }
    const url = new URL(linkDom.href);
    if (url.pathname.match(/\.(jpg)|(png)|(bmp)|(jpeg)|(webp)$/i)) {
      return linkDom;
    }
  }).filter(value => !!value);
}
