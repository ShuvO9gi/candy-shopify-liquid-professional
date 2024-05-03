import { component } from 'picoapp'
import { addToCart } from '../utils/cartFunctions'

export default component((node, ctx) => {
  const form = node.querySelector('.product-single__form')
  const variantId = Number(node.querySelector('[data-variant-select]').value)
  const quantityInput = node.querySelector('[data-quantity]')
  const successMessage = node.querySelector('[data-product-added-message]')
  const cartCountIcon = document.querySelector('.cart-link__bubble')
  // const cartCounters = [...document.querySelectorAll('[data-cart-count]')]

  const success = (cart) => {
    if ( successMessage ) {
      successMessage.classList.add('is--visible')
    }

    if ( cartCountIcon ) {
      cartCountIcon.classList.add('cart-link__bubble--visible')
    }

    ctx.emit('cart:changed');
    // if ( cartCounters.length ) {
    //   cartCounters.forEach(counter => {
    //     counter.setAttribute('data-cart-count', cart.quantity);
    //   })
    // }
  }

  form.addEventListener('submit', e => {
    e.preventDefault()
    let variantId_ = Number(node.querySelector('[data-variant-select]').value);
    const quantity = quantityInput === null ? 1 : quantityInput.value
    addToCart(variantId_, quantity, success)  
  })
})