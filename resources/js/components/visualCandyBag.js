import setToLocalStorage from './setToLocaleStorage';
import totalKilogramsCalculator from './totalKilogramsCalculator';
import closeIcon from './closeIcon';
import infoIcon from './infoIcon';

const deleteCandyItem = (item, candyBag, candyId, correspondingItem) => {
  item.parentNode.removeChild(item);
  const index = candyBag.indexOf(candyBag.find((bag) => bag.id === candyId));
  candyBag.splice(index, 1);
  correspondingItem !== undefined ? correspondingItem.querySelector('[data-qty-wrapper]').classList.remove('is--visible') : '';
  correspondingItem !== undefined ? correspondingItem.querySelector('[data-item-inner]').classList.remove('is--selected') : '';
  correspondingItem !== undefined ? correspondingItem.querySelector('[data-amount-container]').classList.add('hidden') : '';
};

export default function visualCandyBag(
  visualBagWrapper,
  visualBagElem,
  visualBagToggleBtns,
  candyBag, 
  priceLimit,
  fromLocalStorage,
) {
  const stickyFilterBtnElem = document.querySelector('[data-sticky-filter-btn]');
  const stickyBarElem = document.querySelector('[data-sticky-bar]');
  const stickyTotalElem = document.querySelector('[data-sticky-total-btn]');
  
  if (candyBag.length === 0) {
    visualBagWrapper.classList.remove('is--visible');
    visualBagToggleBtns.forEach(visualBagToggleBtn => {
      visualBagToggleBtn.classList.remove('is--visible');
    })
    
    // stickyFilterBtnElem.classList.add('translate-y-full');
    // stickyBarElem.classList.add('translate-y-full');
    stickyTotalElem.classList.add('is--hidden');
    stickyBarElem.classList.remove('translate-y-full');
  } else {
    stickyFilterBtnElem.classList.remove('translate-y-full');
    stickyBarElem.classList.remove('translate-y-full');
    visualBagToggleBtns.forEach(visualBagToggleBtn => {
      visualBagToggleBtn.classList.add('is--visible');
    });
    
    stickyTotalElem.classList.remove('is--hidden');
  }

  visualBagElem.innerHTML = candyBag.map((candy) => {
    const {
      title, img, count, amount, initPrice, price, initWeight, id, weight
    } = candy;

  //   return `
	// <li class="mb-4 last:mb-0 pb-5 sm:pb-0 sm:last:pb-0 border-b sm:border-b-0 border-lightPink last:border-b-0" data-bag-item>
	// 	<div class="flex flex-wrap items-center">
	// 		<div class="flex items-center justify-center sm:justify-start w-full sm:w-1/3 mb-5 sm:mb-0 bag-item-left">
	// 			<img class="block w-[90px] mr-[10px]" src="${img}" alt="${title}">

	// 			<div>
	// 				<p class="text-purple font-heading font-bold text-sm">${title}</p>
	// 				<p class="text-pink font-heading font-bold text-sm">Ca. <span data-item-count-elem>${amount * count}</span> ${theme.strings.blandSelv.stks}</p>
	// 			</div>
	// 		</div>

	// 		<div class="w-full sm:w-1/2 px-2 sm:border-l sm:border-lightPink">
	// 			<div class="flex items-center justify-between relative">
	// 				<div class="pr-2 cursor-pointer" data-info-icon>${infoIcon()}</div>

	// 				<div class="bag-candyBoxBuyButtonClicked candyBoxBuyButtonClicked" data-qty-wrapper data-qty-id="${id}">
	// 					<div data-qty-minus="" class="buttonMinusPlus cursor-pointer">
	// 						<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="26" height="26" rx="13" fill="#FFAD05"/><rect x="7" y="14" width="2" height="12" rx="0.5" transform="rotate(-90 7 14)" fill="white"/></svg>
	// 					</div>
	// 					<div class="candySizes" tracking-wide="">
	// 						<div class="candySizesAmount type-style-card-desc-bold" data-amount-container="">For <span data-qty-amount data-init-price="${initPrice}" data-init-weight="${initWeight}"> ${weight} </span>${theme.strings.blandSelv.gram}.</div>
	// 					</div>
	// 					<div data-qty-plus="" class="buttonMinusPlus cursor-pointer">
	// 						<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="26" height="26" rx="13" transform="matrix(-1 0 0 1 26 0)" fill="#FFAD05"/><rect x="12" y="7" width="2" height="12" rx="0.5" fill="white"/><rect x="7" y="14" width="2" height="12" rx="0.5" transform="rotate(-90 7 14)" fill="white"/></svg>
	// 					</div>
	// 				</div>

	// 				<div class="bland-selv-slik__visual-bag__close pl-2 cursor-pointer" data-remove>${closeIcon()}</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// </li>
  //   `;

    return `
	<li class="mb-4 last:mb-0 sm:pb-0 sm:last:pb-0 sm:border-b-0 border-lightPink last:border-b-0" data-bag-item>
    <div class="drawer_2_content_product_shopAdjust" data-qty-wrapper data-qty-id="${id}">
      <div class="floatLeft drawer_2_content_product_delete_shopAdjust">
        <div data-remove data-qty-id="${id}">
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 4.69231H15.5M6.33714 7.15385V14.5385M9.76571 7.15385V14.5385M2.85714 4.69231H13.1429V16C13.1429 16.5523 12.6951 17 12.1429 17H3.85714C3.30486 17 2.85714 16.5523 2.85714 16V4.69231ZM10.7017 4.69231V2C10.7017 1.44772 10.254 1 9.70171 1H5.98743C5.43514 1 4.98743 1.44772 4.98743 2V4.69231H10.7017Z" stroke="#323232" stroke-width="1.5"/>
          </svg>
        </div>
      </div>		
      <div class="floatLeft drawer_2_content_product_image_shopAdjust">
        <img class="block w-[90px] sm:w-[50px] mr-[10px]" src="${img}" alt="${title}">
      </div>		
      <div class="floatLeft drawer_2_content_product_content_shopAdjust">
        <div class="drawer_2_content_product_name_shopAdjust type-style-card-desc-bold">	
          ${title}
        </div>
        <div class="drawer_2_content_product_weight_shopAdjust type-style-tiny-text">	
          <span class="font-color-pink"><span data-item-count-elem id="customDataAmount">${amount * count}</span> stk.</span> 
          <span class="font-color-purple-dark" data-amount-container=""><span id="customDataWeight" data-qty-amount data-init-price="${initPrice}" data-init-weight="${initWeight}">${weight}</span> g</span>
        </div>
      </div>
      <div class="floatRight drawer_2_content_product_plusOne_shopAdjust" data-qty-plus="">
        <div class="drawer_2_content_product_plus">
          <span>+</span>
        </div>
      </div>
      <div class="floatRight drawer_2_content_product_minusOne_shopAdjust" data-qty-minus="">
        <div class="drawer_2_content_product_minus">
          <span>-</span>					
        </div>
      </div>
      <div class="drawer_clear_shopAdjust"></div>
    </div>
	</li>
    `;
  }).join('');

  const bagItems = visualBagElem.querySelectorAll('[data-bag-item]');
  const plusBtns = visualBagElem.querySelectorAll('[data-qty-plus]');
  const minusBtns = visualBagElem.querySelectorAll('[data-qty-minus]');
  const initPrices = visualBagElem.querySelectorAll('[data-init-price]');
  const initWeights = visualBagElem.querySelectorAll('[data-init-weight]');
  const qtyCountElems = visualBagElem.querySelectorAll('[data-qty-amount]');
  const itemCountElems = visualBagElem.querySelectorAll('[data-item-count-elem]');
  const allProductItems = [...document.querySelectorAll('[data-product-card-item]')];
  const infoIcons = visualBagElem.querySelectorAll('[data-info-icon]');
  const infoCloseBtns = document.querySelectorAll('[data-close-info]');
  const infoModal = document.querySelector('[data-info-modal]');
  const infoModalDescription = document.querySelector('[data-info-modal-description]');
  const infoModalTitle = document.querySelector('[data-info-modal-title]');
  const infoModalImage = document.querySelector('[data-info-modal-image]');
  const removeBtns = visualBagElem.querySelectorAll('[data-remove]');
  const submitBtns = document.querySelectorAll('[data-submit-button]');
  const itemCount = 0;
  const totalCount = 0;
  const totalKilograms = 0;

  /**
   * Add one piece of candy
   */
  plusBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const candyId = Number(btn.parentNode.dataset.qtyId);
      const initPrice = Number(initPrices[i].dataset.initPrice);
      const initWeight = Number(initWeights[i].dataset.initWeight);
      const correspondingItem = allProductItems.find((item) => Number(item.dataset.productItemId) == candyId);

      candyBag.find((bag) => bag.id === candyId).count += 1;
      candyBag.find((bag) => bag.id === candyId).price = initPrice * candyBag.find((bag) => bag.id === candyId).count;
      candyBag.find((bag) => bag.id === candyId).weight = initWeight * candyBag.find((bag) => bag.id === candyId).count;

      itemCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount;
      qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;
      // qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;

      correspondingItem !== undefined ? correspondingItem.querySelector('[data-qty-amount]').innerHTML = candyBag.find((bag) => bag.id === candyId).weight : '';
      correspondingItem !== undefined ? correspondingItem.querySelector('[data-amount-elem]').innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount : '';
      // correspondingItem !== undefined ? correspondingItem.querySelector('[data-product-card-bubble]').classList.add('opacity-0') : '';

      setToLocalStorage(fromLocalStorage, candyBag);
      totalKilogramsCalculator(candyBag, itemCount, totalCount, priceLimit, submitBtns);
    });
  });

  /**
   * Subtract one piece of candy
   */
  minusBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const candyId = Number(btn.parentNode.dataset.qtyId);
      const initPrice = Number(initPrices[i].dataset.initPrice);
      const initWeight = Number(initWeights[i].dataset.initWeight);
      const correspondingItem = allProductItems.find((item) => Number(item.dataset.productItemId) == candyId);

      if (candyBag.find((bag) => bag.id === candyId).count > 1) {
        candyBag.find((bag) => bag.id === candyId).count -= 1;
        candyBag.find((bag) => bag.id === candyId).price = initPrice * candyBag.find((bag) => bag.id === candyId).count;
        candyBag.find((bag) => bag.id === candyId).weight = initWeight * candyBag.find((bag) => bag.id === candyId).count;

        itemCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount;
        qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;

        correspondingItem !== undefined ? correspondingItem.querySelector('[data-qty-amount]').innerHTML = candyBag.find((bag) => bag.id === candyId).weight : '';
        correspondingItem !== undefined ? correspondingItem.querySelector('[data-amount-elem]').innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount : '';

        if (candyBag.find((bag) => bag.id === candyId).count === 1) {
          correspondingItem !== undefined ? correspondingItem.querySelector('[data-product-card-bubble]').classList.remove('opacity-0') : '';
        }
      } else {
        // correspondingItem !== undefined ? correspondingItem.querySelector('[data-product-card-bubble]').classList.add('opacity-0') : '';
        deleteCandyItem(bagItems[i], candyBag, candyId, correspondingItem);
      }

      setToLocalStorage(fromLocalStorage, candyBag);
      totalKilogramsCalculator(candyBag, itemCount, totalCount, priceLimit, submitBtns);
    });
  });

  /**
   * Remove entire candy item from bag
   */
  removeBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const candyId = Number(btn.dataset.qtyId);
      const initPrice = Number(initPrices[i].dataset.initPrice);
      const initWeight = Number(initWeights[i].dataset.initWeight);
      const correspondingItem = allProductItems.find((item) => Number(item.dataset.productItemId) == candyId);
      
      candyBag.find((bag) => bag.id === candyId).count = 1;
      candyBag.find((bag) => bag.id === candyId).price = initPrice * candyBag.find((bag) => bag.id === candyId).count;
      candyBag.find((bag) => bag.id === candyId).weight = initWeight * candyBag.find((bag) => bag.id === candyId).count;

      itemCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount;
      qtyCountElems[i].innerHTML = candyBag.find((bag) => bag.id === candyId).weight;

      correspondingItem !== undefined ? correspondingItem.querySelector('[data-qty-amount]').innerHTML = candyBag.find((bag) => bag.id === candyId).weight : '';
      correspondingItem !== undefined ? correspondingItem.querySelector('[data-amount-elem]').innerHTML = candyBag.find((bag) => bag.id === candyId).count * candyBag.find((bag) => bag.id === candyId).amount : '';

      // correspondingItem !== undefined ? correspondingItem.querySelector('[data-product-card-bubble]').classList.add('opacity-0') : '';
      deleteCandyItem(bagItems[i], candyBag, candyId, correspondingItem);
      setToLocalStorage(fromLocalStorage, candyBag);
      totalKilogramsCalculator(candyBag, itemCount, totalCount, priceLimit, submitBtns);
    });
  });

  /**
     * Open info modals
     */
  infoIcons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
      const candyId = Number(icon.nextElementSibling.dataset.qtyId);
      const correspondingItem = allProductItems.find((item) => Number(item.dataset.productItemId) == candyId);
      const { description, image } = correspondingItem.dataset;
      const infoTitle = description.split('---')[0];
      const infoDescription = description.split('---')[1];

      infoModalImage.setAttribute('src', image);
      infoModalTitle.innerHTML = infoTitle;
      infoModalDescription.innerHTML = infoDescription;
      infoModal.classList.add('is--visible');
    });
  });

  /**
    * Close info modals
    */
  infoCloseBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      infoModal.classList.remove('is--visible');
      infoModalDescription.innerHTML = '';
    });
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      infoModal.classList.remove('is--visible');
      infoModalDescription.innerHTML = '';
    }
  });
}
