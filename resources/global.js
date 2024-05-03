import app from './app';

import frontpageTop from './js/components/frontpageTop';
import blandSelvSlik from './js/custom/blandSelvSlik';
import cart from './js/templates/cart';
import simplePopup from './js/components/simplePopup';
import collection from './js/templates/collection';
import filterSidebar from './js/components/filter-sidebar';
import product from './js/templates/product';
import header from './js/templates/header';
import speechBubble from './js/components/speech-bubble';
import visualBag from './js/components/visual-bag';
import { fetchCart } from './js/utils/cartFunctions';
import drawer from './js/custom/drawer';
import addToCart from './js/components/addToCart';
import upSell from './js/components/upSell';
import upsellDetail from './js/components/upsellDetail';
import upsellButton from './js/components/upsellButton';
import cleanPose from './js/components/cleanPose';
import homepageProducts from './js/custom/homepageProducts';
import homepageUserReviews from './js/custom/homepageUserReviews';

//console.log(header)
// require('./css/app.css');

app.add({
  frontpageTop,
  blandSelvSlik,
  cart,
  collection,
  filterSidebar,
  product,
  header,
  speechBubble,
  visualBag,
  simplePopup,
  drawer,
  addToCart,
  upSell,
  upsellDetail,
  upsellButton,
  cleanPose,
  homepageProducts,
  homepageUserReviews
});

const updateCartCounters = (qty) => {
  const cartCounters = [...document.querySelectorAll('[data-cart-count]')];
  if (cartCounters.length) {
    cartCounters.forEach(counter => {
      counter.setAttribute('data-cart-count', qty);
    })
  }
}

async function calculateCartCounters() {
  const cart = await fetchCart();

  const subProducts = [];
  const products = [];
  let normalProductsCount = 0;

  cart.items.forEach(item => {
    if (item.properties?.hasOwnProperty('ID')) subProducts.push(item)
    else products.push(item)
  });

  const mixes = subProducts.map(item => item.properties.ID);
  const amountOfProductsFromSubs = [...new Set(mixes)].length;

  products.forEach(p => normalProductsCount += p.quantity);

  const realProductsInCart = amountOfProductsFromSubs + normalProductsCount;

  updateCartCounters(realProductsInCart);
}

calculateCartCounters();
app.on('cart:changed', () => calculateCartCounters());
app.on('cart:fired', ({ cart }) => {
  app.hydrate({ cart: cart });
});

app.mount();
