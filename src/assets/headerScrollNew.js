const topbar = document.querySelector('[data-topbar]');
const mainEl = document.querySelector('.main-content');
const body = document.getElementsByTagName('body')[0];

/**
  * Variables
  */
const topbarClientHeight = topbar.clientHeight;

/**
  * Functions
  */
const stickyHeader = () => {
  body.classList.add('sticky--header');
  mainEl.style.paddingTop = `${topbarClientHeight}px`;
};
stickyHeader();

/**
  * Eventlisteners
  */
document.addEventListener('scroll', stickyHeader);
window.addEventListener('resize', stickyHeader);
