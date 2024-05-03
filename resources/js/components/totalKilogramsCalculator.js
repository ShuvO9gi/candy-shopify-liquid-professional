import { formatMoney } from '../utils/currency';

export default function totalKilogramsCalculator(candyBag, itemCount, totalCount, priceLimit, submitBtns) {
  let amountElems = document.querySelectorAll('[data-buy-more-amount]');
  const gramElemMobile = document.querySelector('[data-gram-elem-mobile]');
  const gramElem = document.querySelector('[data-gram-elem]');
  const totalPriceElem = document.querySelector('[data-total-price-elem]');
  const totalPriceElemMobile = document.querySelector('[data-total-price-elem-mobile]');
  const speechBubbles = document.querySelectorAll('[data-price-speech-bubble]');
  let itemPrice;
  let totalPrice;
  let weightArr;
  let totalWeight;

  // Find total price
  if (candyBag.length) {
    itemPrice = candyBag.map((bag) => bag.price);
    totalPrice = itemPrice.reduce((price, item) => {
      price += Number(item);
      return price;
    });
  }

  totalPriceElem.innerHTML = formatMoney(totalPrice);
  totalPriceElemMobile.innerHTML = formatMoney(totalPrice);

  // Find total item count
  if (candyBag.length) {
    itemCount = candyBag.map((bag) => bag.count);
    totalCount = itemCount.reduce((count, item) => {
      count += item;
      return count;
    });
  }

  // Find total weight
  if (candyBag.length) {
    weightArr = candyBag.map((bag) => bag.weight);
    totalWeight = weightArr.reduce((weight, item) => {
      weight += Number(item);
      return weight;
    });
  } else {
    totalWeight = 0;
  }

  gramElem.innerHTML = `${totalWeight} g`;
  gramElemMobile.innerHTML = `${totalWeight} g`;

  if ((totalPrice / 100) < priceLimit) {
    submitBtns.forEach(submitBtn => {
      submitBtn.innerHTML = theme.strings.blandSelv.buyMore;
      submitBtn.disabled = true;
    })
    
    document.querySelectorAll('[data-buy-more-amount]').forEach(amountElem => {
      amountElem.innerHTML = `&nbsp;${priceLimit - Math.ceil((totalPrice / 100))}&nbsp;`;
    })

    setTimeout(() => {
      speechBubbles.forEach((speechBubble) => {
        speechBubble.classList.remove('opacity-0');
      });
    }, 1000);
  } else {
    submitBtns.forEach(submitBtn => {
      submitBtn.innerHTML = theme.strings.blandSelv.closeBag;
      submitBtn.disabled = false;
    })
    
    speechBubbles.forEach((speechBubble) => {
      speechBubble.classList.add('opacity-0');
    });
  }
}
