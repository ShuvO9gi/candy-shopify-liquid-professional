export default function headerScroll(node) {
  /**
   * DOM elements
   */
  const { body } = document;
  const topbar = node.querySelector('[data-topbar]');
  const nav = node.querySelector('[data-nav]');
  const mainEl = document.querySelector('.main-content');

  /**
    * Variables
    */
  const topbarHeight = topbar.scrollHeight;
  const navHeight = nav.scrollHeight;
  const mainHeight = topbarHeight + navHeight;

  /**
    * Functions
    */
  const stickyHeader = () => {
    const windowTop = window.pageYOffset;

    if (windowTop > 0) {
      body.classList.add('sticky--header');
      mainEl.style.paddingTop = `${mainHeight}px`;
    } else {
      body.classList.remove('sticky--header');
      mainEl.style.paddingTop = '0';
    }
  };
  stickyHeader();

  /**
    * Eventlisteners
    */
  document.addEventListener('scroll', stickyHeader);
  window.addEventListener('resize', stickyHeader);
}
