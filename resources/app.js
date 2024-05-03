import { picoapp } from 'picoapp';
// import frontpageTop from './js/components/frontpageTop';
// import blandSelvSlik from './js/custom/blandSelvSlik';
// import cart from './js/templates/cart';
// import tutorialPopups from './js/components/tutorialPopups';
// import collection from './js/templates/collection';
// import product from './js/templates/product';
// import customScrollbar from './js/components/customScrollbar';
// import header from './js/templates/header';

// require('./css/app.css');

// const app = picoapp({
//   frontpageTop,
//   blandSelvSlik,
//   cart,
//   tutorialPopups,
//   collection,
//   product,
//   customScrollbar,
//   header,
// });

const app = picoapp();

app.hydrate({
  cart: theme.settings.cart,
  cartTotal: theme.settings.cart.total_price,
});

// window.app = app;
export default app;
