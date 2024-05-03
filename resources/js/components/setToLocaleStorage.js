export default function setToLocalStorage(fromLocalStorage, candyBag) {
  if (fromLocalStorage === null) {
    window.localStorage.setItem('candybag', JSON.stringify(candyBag))
  }
  else {
    window.localStorage.removeItem('candybag')
    window.localStorage.setItem('candybag', JSON.stringify(candyBag))
  }
}