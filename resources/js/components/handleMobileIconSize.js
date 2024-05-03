export default function handleMobileIconSize(node) {
  /**
   * DOM elements
   */
  const icon = node.querySelector('[data-mobile-menu-open]');
  const floatingEl = node.querySelector('[data-floating-cart]');

  /**
   * Variables
   */
  const iconHeight = icon.scrollHeight;

  /**
   * Functions
   */

  const setIconWidth = () => {
    icon.style.width = `${iconHeight}px`;
    floatingEl.style.width = `${iconHeight}px`;
  };

  document.addEventListener('DOMContentLoaded', () => {
    setIconWidth();
  });
  document.addEventListener('scroll', () => {
    setIconWidth();
  });
  window.addEventListener('resize', () => {
    setIconWidth();
  });
}
