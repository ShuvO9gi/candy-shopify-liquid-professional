export default function plusCandy(addToBagBtns, candyBag, qtyCountElems, amountContainers, amountElems, i) {
  const candyId = Number(addToBagBtns[i].dataset.id);

  const initPrice = Number(qtyCountElems[i].dataset.initPrice);
  const initWeight = Number(qtyCountElems[i].dataset.initWeight); 

  candyBag.find((bag) => bag.id === candyId).count += 1;
  candyBag.find((bag) => bag.id === candyId).price = initPrice * candyBag.find((bag) => bag.id === candyId).count;
  candyBag.find((bag) => bag.id === candyId).weight = initWeight * candyBag.find((bag) => bag.id === candyId).count;

  amountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).amount * candyBag.find((bag) => bag.id === candyId).count;

  amountContainers[i].classList.remove('hidden');
  // productCardBubbles[i].classList.remove('opacity-0');
  // qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).price / 100;
  qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;
}
