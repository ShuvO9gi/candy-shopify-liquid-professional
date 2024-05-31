//Both Memory & localStorage Caching is efficient but it can't track update of shopify
//product store, we have to use webhook with server setup using express or node.js
//Product In-Memory Caching
// const productCache = {};

// async function fetchProducts(pageNumber) {
//   if (productCache[pageNumber]) {
//     return productCache[pageNumber];
//   }

//   const response = await fetch(`/products.json?limit=250&page=${pageNumber}`, {
//     method: "GET",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Requested-With": "XMLHttpRequest",
//     },
//   });

//   const data = await response.json();
//   productCache[pageNumber] = data;
//   return data;
// }

//LocalStorage Caching
// const productCacheKey = "productCache";

// function saveToLocalStorage(key, value) {
//   localStorage.setItem(key, JSON.stringify(value));
// }

// function getFromLocalStorage(key) {
//   const value = localStorage.getItem(key);
//   return value ? JSON.parse(value) : null;
// }

// async function fetchProducts(pageNumber) {
//   const cachedProducts = getFromLocalStorage(productCacheKey);
//   if (cachedProducts && cachedProducts[pageNumber]) {
//     return cachedProducts[pageNumber];
//   }

//   const response = await fetch(`/products.json?limit=250&page=${pageNumber}`, {
//     method: "GET",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Requested-With": "XMLHttpRequest",
//     },
//   });

//   const data = await response.json();
//   const updatedCache = cachedProducts
//     ? { ...cachedProducts, [pageNumber]: data }
//     : { [pageNumber]: data };
//   saveToLocalStorage(productCacheKey, updatedCache);
//   return data;
// }

function fetchProducts(pageNumber) {
  return fetch(`/products.json?limit=250&page=${pageNumber}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }).then((response) => response.json());
}

async function getAllProducts() {
  let allProducts = [];
  let pageNumber = 1;
  let hasMoreProducts = true;

  while (hasMoreProducts) {
    const productsPage = await fetchProducts(pageNumber);
    allProducts = allProducts.concat(productsPage.products);
    pageNumber++;
    if (productsPage.products.length < 250) {
      hasMoreProducts = false;
    }
  }

  return allProducts;
}

// Function to check if items exist
export async function checkItemsExist(items) {
  let exists = true;
  let unAvailableProducts = [];
  const allProducts = await getAllProducts();

  items.forEach((item) => {
    const product = allProducts.find((p) =>
      p.variants.map((v) => v.id).includes(item.id)
    );
    if (!product) {
      exists = false;
      unAvailableProducts.push(item.id);
    }
  });

  return { exists, unAvailableProducts };
}

export default function submitBagToCart(items, callback, namePromptModal) {
  checkItemsExist(items).then(({ exists, unAvailableProducts }) => {
    // If items id exists in unAvailableProducts, remove from items
    if (unAvailableProducts.length > 0) {
      items = items.filter((item) => !unAvailableProducts.includes(item.id));
    }

    if (!items.length) {
      alert(
        "All items in your bag are currently unavailable. Please try again later."
      );
      return;
    }

    // Submit bag to cart
    fetch("/cart/add.js", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ items }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.items && response.items.length > 0) {
          callback(namePromptModal);

          //remove selected items from localstorage
          // window.localStorage.removeItem("candybag");
        } else {
          alert(response.description);
        }
      });
  });
}
