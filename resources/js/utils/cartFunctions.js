import updateLineItemPrices from "../components/updateLineItemPrices";
import updateNormalLineItemPrice from "../components/updateNormalLineItemPrice";
import updateTotalPrices from "../components/updateTotalPrices";
import app from "../../app";

export function fetchCart() {
  return fetch("/cart.js", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }).then((res) => res.json());
}

function changeAddon(line, quantity, callback, id, node) {
  return fetch("/cart/change.js", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ line, quantity }),
  })
    .then((res) => res.json())
    .then((cart) => {
      callback !== undefined ? callback(id) : null;
      updateTotalPrices(node, cart);
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

export function updateCart(id, quantity, callback, node) {
  return fetchCart().then(({ items }) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].variant_id === parseInt(id)) {
        return changeAddon(i + 1, quantity, callback, id, node); // shopify cart is a 1-based index
      }
    }
  });
}

export function changeSingleLineItem(obj, node) {
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
      updateLineItemPrices(node, false, cart.items);
      updateNormalLineItemPrice(node, cart.items);
      updateTotalPrices(node, cart);
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

export function addToCart(id, quantity, callback) {
  return fetch("/cart/add.js?app=true", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ id, quantity }),
  })
    .then((res) => res.json())
    .then((cart) => {
      callback?.(cart);
    });
}

export function updateDrawerLineItem(obj) {
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
    });
}

export function updateLineItem(obj) {
  return fetch("/cart/update.js", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ updates: obj }),
  }).then((res) => res.json());
}

export function createProperties({ product, quantity, properties }) {
  return {
    items: [
      {
        id: product,
        quantity: quantity,
        properties: properties,
      },
    ],
  };
}
