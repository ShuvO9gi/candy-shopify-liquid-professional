export default function submitBagToCart(items, callback, namePromptModal) {
  // Submit the bag to cart
  fetch('/cart/add.js', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ items }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status) {
        alert(data.description);
      } else {
        // Remove candyBag from localeStorage
        window.localStorage.removeItem('candybag');
        // Ask if the user wants to go to cart or mix another bag and make corresponding action
        callback(namePromptModal);
        
      }
    });
}
