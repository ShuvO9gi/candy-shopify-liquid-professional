import { component } from "picoapp";

export default component((node, ctx) => {
  node.addEventListener("click", (e) => {
    e.preventDefault();
    const items = {};
    const addToCartForm = node.closest("form");
    let formData = new FormData(addToCartForm);
    fetch("/cart/add.js", {
      method: "POST",
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status) {
          alert(data.description);
        } else {
          document.querySelector('[href="/cart"]').click();
        }
      });
  });
});
