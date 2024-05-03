import { changeSingleLineItem } from '../utils/cartFunctions'
import debounce from '../utils/debounce'
import updateLineItemPrices from './updateLineItemPrices'

export default function changeNormalLineItems(lineItems, node) {
  const normalItemQtyMinusBtns = node.querySelectorAll('[data-normal-item-qty-minus]')
  const normalItemQtyPlusBtns = node.querySelectorAll('[data-normal-item-qty-plus]')
  const normalItemQtyElem = node.querySelectorAll('[data-normal-item-qty-elem]')

  lineItems.forEach((item, i) => {
    const itemKey = item.dataset.normalItemKey // Get line-item key in order to change only the specific line-item in case there's more bags containing the same line-item
    let currentQuantity = Number(item.dataset.normalItemQty)
    let obj = {} // Create empty object that will contain line-item key and new, updated quantity

    normalItemQtyMinusBtns[i].addEventListener('click', () => {
      // If the quantity is 1 and you click minus -> remove the line-item
      if (currentQuantity === 1) {
        item.parentNode.removeChild(item)
        obj[itemKey] = 0
        return
      }

      currentQuantity -= 1
      normalItemQtyElem[i].innerHTML = currentQuantity

      obj[itemKey] = currentQuantity
    })

    // Decounce function that fires after 500ms is case the user clicks multiple times in a row
    normalItemQtyMinusBtns[i].addEventListener('click', debounce(function() {
      changeSingleLineItem(obj, node)
    }, 500))

    normalItemQtyPlusBtns[i].addEventListener('click', () => {
      currentQuantity += 1
      normalItemQtyElem[i].innerHTML = currentQuantity
      obj[itemKey] = currentQuantity
    })

    // Decounce function that fires after 500ms is case the user clicks multiple times in a row
    normalItemQtyPlusBtns[i].addEventListener('click', debounce(function() {
      changeSingleLineItem(obj, node)
    }, 500))
  })
}