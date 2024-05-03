export default function mobileMenu(node) {
  /**
   * DOM elements
   */
  const { body } = document;
  const openIcon = node.querySelector('[data-mobile-menu-open]');
  const menu = document.querySelector('[data-mobile-menu]');
  const closeIcon = menu.querySelector('[data-mobile-menu-close]');

  //console.log('menu', openIcon)
  /**
   * Functions
   */
  const openMenuHandler = () => {
    //console.log('open')
    body.classList.add('mobile-menu--open');
  };

  const closeMenuHandler = () => {
    body.classList.remove('mobile-menu--open');
  };

  /**
   * Eventlisteners
   */
  openIcon.addEventListener('click', openMenuHandler);
  closeIcon.addEventListener('click', closeMenuHandler);
  document.addEventListener('click', (e) => {
    if (e.target === menu) closeMenuHandler();
  });
}
   