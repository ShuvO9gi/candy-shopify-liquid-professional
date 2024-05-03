import { component } from 'picoapp';
import CustomScroll from '../utils/customScroll';

export default component((node) => {
  /**
   * Variables + DOM elements
   */
  const containerElem = node.querySelector('[data-visual-bag]');
  const scrollbarElem = node.querySelector('[data-custom-scrollbar]');

  /**
   * Init class
   */
  setTimeout(() => {
    (() => new CustomScroll(containerElem, scrollbarElem))();
  }, 3000);
});
