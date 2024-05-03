import { formatMoney } from '../utils/currency';

export default function updateLineItemPrices(node, onLoad = true, cartItems) {
  const candyLineItems = [...node.querySelectorAll('[data-candybag-item]')];
  const finalLinePriceElems = node.querySelectorAll('[data-total-line-price]');

  candyLineItems.forEach((item, i) => {
    const lineItems = [...item.querySelectorAll('[data-line-item]')];
    let lineItemPrices;
    let finalPrice;

    if (onLoad) {
      lineItemPrices = lineItems.map((item) => Number(item.dataset.lineItemPrice));

      finalPrice = lineItemPrices.reduce((price, item) => {
        price += item;
        return price;
      });

      finalLinePriceElems[i].innerHTML = formatMoney(finalPrice);
    } else {
      const bagId = item.dataset.candybagItemId;

      const currentBag = cartItems.filter((item) => {
        if (item.properties !== null) {
          if (Object.values(item.properties)[0] === bagId) return item;
        }
      });

      lineItemPrices = currentBag.map((bagItem) => bagItem.final_line_price);

      finalPrice = lineItemPrices.reduce((price, item) => {
        price += item;
        return price;
      });

      finalLinePriceElems[i].innerHTML = formatMoney(finalPrice);
    }
  });
}
