import { component } from 'picoapp';
import smoothScrollToId from './smoothScrollToId';

export default component((node) => {
  /**
   * This will make sure that video reviews will have the highest z-index when opened
   */

  /**
   * DOM elements
   */
  const image = node.querySelector('[data-top-image]');
  const imagesWidthZ = document.querySelectorAll('.image-w-z');
  const header = document.querySelector('[data-header]');

  /**
   * Eventlisteners + functions
   */
  document.addEventListener('click', () => {
    const boastModals = document.querySelectorAll('.boast-modal');

    for (let i = 0; i < boastModals.length; i++) {
      const boastModal = boastModals[i];
      const hasClass = boastModal.classList.contains('active');

      if (hasClass) {
        image.classList.add('in--back');
        imagesWidthZ.forEach((img) => {
          img.classList.add('in--back');
        });
        header.style.zIndex = 1;
        break;
      } else {
        image.classList.remove('in--back');
        imagesWidthZ.forEach((img) => {
          img.classList.remove('in--back');
        });
        header.style.zIndex = 100;
      }
    }
  });

  // Smooth scroll to id
  smoothScrollToId();
});
