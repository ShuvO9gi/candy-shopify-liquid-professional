export default function minusCandy(
  addToBagBtns,
  qtyWrappers,
  candyBag,
  qtyCountElems, 
  amountContainers,
  amountElems,
  itemInners,
  submitBtns,
  i,
) {
  const gramElem = document.querySelector('[data-gram-elem]');
  const gramElemMobile = document.querySelector('[data-gram-elem-mobile]');
  const totalPriceElem = document.querySelector('[data-total-price-elem]');
  const totalPriceElemMobile = document.querySelector('[data-total-price-elem-mobile]');
  const candyId = Number(addToBagBtns[i].dataset.id);
  const speechBubble = document.querySelector('[data-price-speech-bubble]');
  const productCardBubbles = document.querySelectorAll('[data-product-card-bubble]');
  const priceBubbles = document.querySelectorAll('[data-price-speech-bubble]');

  const initPrice = Number(qtyCountElems[i].dataset.initPrice);
  const initWeight = Number(qtyCountElems[i].dataset.initWeight);

  if (candyBag.find((bag) => bag.id === candyId).count > 1) {
    candyBag.find((bag) => bag.id === candyId).count -= 1;
    candyBag.find((bag) => bag.id === candyId).price = initPrice * candyBag.find((bag) => bag.id === candyId).count;
    candyBag.find((bag) => bag.id === candyId).weight = initWeight * candyBag.find((bag) => bag.id === candyId).count;
    // qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).price / 100;
    // amountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).amount * candyBag.find((bag) => bag.id === candyId).count;

    qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;
    amountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).amount * candyBag.find((bag) => bag.id === candyId).count;

    if (candyBag.find((bag) => bag.id === candyId).count === 1) {
      productCardBubbles[i].classList.remove('opacity-0');
    }
  } else {
    qtyWrappers[i].classList.remove('is--visible');
    itemInners[i].classList.remove('is--selected');
    amountContainers[i].classList.add('hidden');
    const index = candyBag.indexOf(candyBag.find((bag) => bag.id === candyId));
    candyBag.splice(index, 1);
    speechBubble !== null ?? speechBubble.classList.add('hidden');
    // productCardBubbles[i].classList.add('opacity-0');
  }

  if (candyBag.length === 0) {
    submitBtns.forEach(submitBtn => {
      submitBtn.innerHTML = theme.strings.blandSelv.bagEmpty;
    })
    
    gramElem.innerHTML = `0 ${theme.strings.blandSelv.gram}`;
    gramElemMobile.innerHTML = `0 ${theme.strings.blandSelv.gram}`;
    totalPriceElem.innerHTML = `0 ${theme.strings.blandSelv.kr}`;
    totalPriceElemMobile.innerHTML = `0 ${theme.strings.blandSelv.kr}`;
    priceBubbles.forEach((bubble) => {
      //bubble.classList.add('opacity-0');
    });
  }
}
