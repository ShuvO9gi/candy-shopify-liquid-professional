import { component } from 'picoapp';

export default component((node, ctx) => {
  const { id } = node.dataset;
  const triggers = [...document.querySelectorAll(`[data-trigger-popup="${ id }"]`)];
  const container = node;

  const close = () => node.classList.remove('is--visible');
  const open = () => node.classList.add('is--visible');
  const toggle = () => {
    if ( !node.classList.contains('is--visible') ) open();
    else close();
  }
 
  // toggle popup
  if (triggers.length) {
    triggers.forEach((btn) => {
      btn.addEventListener('click', () => toggle());
    });
  }

  // close by clicking outside element
  document.addEventListener('click', e => {
    if ( !container.contains(e.target) && !triggers.includes(e.target) ) {
      close();
    }
  })

  // close by clicking esc
  document.addEventListener('keyup', e => {
    if ( e.key === 'Escape' ) close();
  });
});
