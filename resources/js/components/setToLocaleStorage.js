export default function setToLocalStorage(fromLocalStorage, candyBag) {
  if (fromLocalStorage !== null) {
    window.localStorage.removeItem("candybag");
  }
  window.localStorage.setItem("candybag", JSON.stringify(candyBag));
  window.localStorage.setItem("bagLastUpdated", new Date().toISOString());
}
