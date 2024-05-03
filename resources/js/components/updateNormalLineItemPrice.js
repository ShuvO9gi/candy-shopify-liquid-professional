import { formatMoney } from '../utils/currency';

export default function updateNormalLineItemPrice(node, cartItems) {
  const lineItems = [...node.querySelectorAll('[data-normal-item]')];
  const priceElems = node.querySelectorAll('[data-normal-item-price]');

  lineItems.forEach((item, i) => {
    const itemKey = item.dataset.normalItemKey;

    const currentItem = cartItems.find((item) => item.key === itemKey);
    const currentPrice = formatMoney(currentItem.final_line_price);

    priceElems[i].innerHTML = currentPrice;
  });
}
