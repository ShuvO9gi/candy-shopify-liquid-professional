import { component } from 'picoapp';
import { setCookie, getCookie } from '../utils/cookies';

export default component((node) => {
  /**
   * DOM elems + vars
   */
  const speechBubbles = node.querySelectorAll('[data-speech-bubble]');
  const closeBtns = node.querySelectorAll('[data-speech-bubble-close]');

  /**
   * Functions
   */
  const checkCookie = () => {
    closeBtns.forEach((closeBtn, i) => {
      const name = `bubble_${i}`;
      const id = closeBtn.dataset.speechBubbleId;

      if (getCookie(name) !== id) {
        speechBubbles[i].classList.remove('hidden');
      }
    });
  };
  checkCookie();

  /**
   * Eventlisteners
   */
  closeBtns.forEach((closeBtn, i) => {
    const id = closeBtn.dataset.speechBubbleId;

    closeBtn.addEventListener('click', () => {
      const name = `bubble_${i}`;

      speechBubbles[i].classList.add('hidden');

      setCookie(name, id, 1);
    });
  });
});
