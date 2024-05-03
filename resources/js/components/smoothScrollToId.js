export default function smoothScrollToId() {
  /**
   * Smooth scroll to bottom video reviews
   */
  document
    .querySelectorAll('a[href^="#"]')
    .forEach((trigger) => {
      trigger.onclick = function (e) {
        e.preventDefault();
        const hash = this.getAttribute('href');
        const target = document.querySelector(hash);
        const headerOffset = 500;
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition + headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      };
    });
}
