import { changeSingleLineItem } from '../utils/cartFunctions'
import debounce from '../utils/debounce'
import updateLineItemPrices from './updateLineItemPrices'
import app from '../../app'

export default function changeCandyLineItems(candyItems, node) {
  const lineItems = node.querySelectorAll('[data-line-item]')
  const itemQtyMinusBtns = node.querySelectorAll('[data-item-qty-minus]') 
  const itemQtyPlusBtns = node.querySelectorAll('[data-item-qty-plus]')
  const itemQtyElem = node.querySelectorAll('[data-item-qty-elem]')

  lineItems.forEach((item, i) => {
    const itemId = item.dataset.candyItemKey // Get line-item key in order to change only the specific line-item in case there's more bags containing the same line-item
    let currentQuantity = Number(item.dataset.itemQuantity)
    const weight = Number(item.dataset.itemWeight)
    let currentWeight = currentQuantity * weight
    let obj = {} // Create empty object that will contain line-item key and new, updated quantity

    itemQtyMinusBtns[i].addEventListener('click', () => {
      // If the quantity is 1 and you click minus -> remove the line-item
      if (currentQuantity === 1) {
        // If it's the last line-item in the bag -> remove the intire bag
        const getBagProp = item.parentNode.dataset.listItemIdentifier // Get the name prop of bag
        const bagToRemove = candyItems.find(candyItem => candyItem.dataset.candybagItemId === getBagProp) // Find the correct bag
        const listItemCount = item.parentNode.childElementCount // Check childElementCount of parent ul

        if (listItemCount === 1) bagToRemove.parentNode.removeChild(bagToRemove) // Remove entire bag

        item.parentNode.removeChild(item)
        obj[itemId] = 0
        return
      }

      currentQuantity -= 1
      currentWeight = currentQuantity * weight

      itemQtyElem[i].innerHTML = currentWeight

      obj[itemId] = currentQuantity
      app.emit('cart:changed');
    })

    // Decounce function that fires after 500ms is case the user clicks multiple times in a row
    itemQtyMinusBtns[i].addEventListener('click', debounce(function() {
      changeSingleLineItem(obj, node)
    }, 500))

    itemQtyPlusBtns[i].addEventListener('click', () => {
      currentQuantity += 1
      currentWeight = currentQuantity * weight

      itemQtyElem[i].innerHTML = currentWeight

      obj[itemId] = currentQuantity
      app.emit('cart:changed');
    })

    // Decounce function that fires after 500ms is case the user clicks multiple times in a row
    itemQtyPlusBtns[i].addEventListener('click', debounce(function() {
      changeSingleLineItem(obj, node)
    }, 500))
  })
}