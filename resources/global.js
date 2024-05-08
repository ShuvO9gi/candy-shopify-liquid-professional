import app from "./app";

import frontpageTop from "./js/components/frontpageTop";
import blandSelvSlik from "./js/custom/blandSelvSlik";
import cart from "./js/templates/cart";
import simplePopup from "./js/components/simplePopup";
import collection from "./js/templates/collection";
import filterSidebar from "./js/components/filter-sidebar";
import product from "./js/templates/product";
import header from "./js/templates/header";
import speechBubble from "./js/components/speech-bubble";
import visualBag from "./js/components/visual-bag";
import { fetchCart } from "./js/utils/cartFunctions";
import drawer from "./js/custom/drawer";
import addToCart from "./js/components/addToCart";
import upSell from "./js/components/upSell";
import upsellDetail from "./js/components/upsellDetail";
import upsellButton from "./js/components/upsellButton";
import cleanPose from "./js/components/cleanPose";
import homepageProducts from "./js/custom/homepageProducts";
import homepageUserReviews from "./js/custom/homepageUserReviews";

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
  homepageUserReviews,
});

const updateCartCounters = (qty) => {
  const cartCounters = [...document.querySelectorAll("[data-cart-count]")];
  if (cartCounters.length) {
    cartCounters.forEach((counter) => {
      counter.setAttribute("data-cart-count", qty);
    });
  }
};

async function calculateCartCounters() {
  const cart = await fetchCart();

  const subProducts = [];
  const products = [];
  let normalProductsCount = 0;

  cart.items.forEach((item) => {
    if (item.properties?.hasOwnProperty("ID")) subProducts.push(item);
    else products.push(item);
  });

  const mixes = subProducts.map((item) => item.properties.ID);
  const amountOfProductsFromSubs = [...new Set(mixes)].length;

  products.forEach((p) => (normalProductsCount += p.quantity));

  const realProductsInCart = amountOfProductsFromSubs + normalProductsCount;

  updateCartCounters(realProductsInCart);
}

function changeSingleLineItem(obj) {
  return fetch("/cart/update.js", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ updates: obj }),
  })
    .then((res) => res.json())
    .then((cart) => {
      app.emit("cart:changed");
      if (cart.item_count === 0) {
        const cartContent = document.querySelector("[data-cart-content]");
        cartContent.innerHTML = `
                  <div class="bg-white rounded-md p-9 shadow-custom">
                      <p>${theme.strings.cartEmpty}</p>
                  </div>
              `;
      }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  var cookies = document.cookie;
  console.log({ cookies });

  var prevTime = localStorage.getItem("bagLastUpdated")
    ? new Date(localStorage.getItem("bagLastUpdated"))
    : new Date();
  var currentTime = new Date();
  var timeDifference = currentTime - prevTime;
  console.log({ timeDifference });

  //if time difference is greater than 3 hours
  if (timeDifference > 3 * 60 * 60 * 1000) {
    localStorage.removeItem("cart");

    fetch("/cart.js", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((res) => res.json())
      .then((cart) => {
        const { items } = cart;

        // Function to remove the list item form dom
        let obj = {};
        items.forEach((item) => {
          const id = item.key;
          obj[id] = 0;
        });

        changeSingleLineItem(obj);
        app.hydrate({ cartTotal: 0 });
      });
    localStorage.removeItem("bagLastUpdated");
  }
});

calculateCartCounters();
app.on("cart:changed", () => calculateCartCounters());
app.on("cart:fired", ({ cart }) => {
  app.hydrate({ cart: cart });
});

app.mount();
