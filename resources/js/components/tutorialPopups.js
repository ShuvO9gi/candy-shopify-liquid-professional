import { component } from 'picoapp';
import { setCookie, getCookie } from '../utils/cookies';

export default component((node, ctx) => {
  if (getCookie('tutorial') === null) {
    /**
     * Variables
     */
    const sliderElem = node.querySelector('[data-tutorial-slider]');
    const slideElems = sliderElem.querySelectorAll('[data-tutorial-slide]');
    const closeBtn = node.querySelector('[data-tutorial-close]');
    const prev = node.querySelector('[data-tutorial-prev]');
    const next = node.querySelector('[data-tutorial-next]');

    let current = 0;
    const dist = 264;

    /**
     * Show tutorial
     */
    node.classList.remove('is--hidden');

    /**
     * Functions
     */
    const closePopupHandler = () => {
      // Set the cookie to hide popup on reload
      setCookie('tutorial', true, 1);

      // Hide popup
      node.classList.add('is--hidden');
    };

    const nextSlideHandler = () => {
      prev.disabled = false; // Enable prev btn

      if (current < slideElems.length - 1) {
        current += 1; // Update current slide

        slideElems.forEach((slide) => {
          slide.style.transform = `translate(-${dist * current}px, 0)`; // Move slides forward
        });
      }

      if (current === slideElems.length - 1) {
        next.disabled = true; // Disable next btn if on last slide
      }
    };

    const prevSlideHandler = () => {
      next.disabled = false; // Enable next btn

      if (current > 0) {
        current -= 1; // Update current slide

        slideElems.forEach((slide) => {
          slide.style.transform = `translate(-${dist * current}px, 0)`; // Move slides back
        });
      }

      if (current === 0) {
        prev.disabled = true; // Disable prev btn if first slide
      }
    };

    /**
     * Eventlisteners
     */
    next.addEventListener('click', nextSlideHandler);

    prev.addEventListener('click', prevSlideHandler);

    closeBtn.addEventListener('click', closePopupHandler);
  }
});