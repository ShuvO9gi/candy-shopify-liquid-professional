import 'scroll-behavior-polyfill';

export default function scrolltoTop() {
  const button = document.querySelector('[data-to-top]');

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
}
