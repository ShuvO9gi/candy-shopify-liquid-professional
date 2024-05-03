import { component } from 'picoapp';

import { formatMoney } from '../utils/currency';

import { updateCart, changeSingleLineItem } from '../utils/cartFunctions';
import updateTotalPrices from '../components/updateTotalPrices';

import Tabify from '../utils/Tabify';

import changeNormalLineItems from '../components/changeNormalLineItems';
import changeCandyLineItems from '../components/changeCandyLineItems';
import updateLineItemPrices from '../components/updateLineItemPrices';

export default component((node, ctx) => {
  /**
   * Set total line_item_price of candy bag
   */
  const candyItems = [...node.querySelectorAll('[data-candybag-item]')];
  updateLineItemPrices(node);

  /**
   * Toggle bag list tab
   */
  const listToggles = node.querySelectorAll('[data-candy-list-toggle]');
  const listWrappers = node.querySelectorAll('[data-candy-list-wrapper]');
  const toggleIcons = node.querySelectorAll('[data-toggle-icon]');

  // Init Tabify class
  const tabs = new Tabify(listToggles, listWrappers, toggleIcons);

  /**
   * Remove normal line items
   */
  const removeNormalBtns = node.querySelectorAll('[data-remove-normal]');
  const normalLineItems = [...node.querySelectorAll('[data-normal-item]')];

  // function to find the correct dom element (<li> element) and remove from dom
  const removeItem = (id) => {
    const item = normalLineItems.find((item) => Number(item.dataset.lineItemId) === id);
    item.parentNode.removeChild(item);
  };

  // Eventlistener on remove buttons
  removeNormalBtns.forEach((btn) => {
    const itemId = Number(btn.dataset.id);

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // set the correct line item quantity to 0
      // the removeItem funciton removes the line item from the dom
      updateCart(itemId, 0, removeItem, node);
    });
  });

  /**
   * Remove candy bag items
   */
  const removeCandyBtns = node.querySelectorAll('[data-remove-candy]');

  removeCandyBtns.forEach((btn) => {
    const bagId = btn.dataset.id;

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      fetch('/cart.js', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then((res) => res.json())
        .then((cart) => {
          const { items } = cart;

          // Function to remove the list item form dom
          const lineItemToRemove = candyItems.find((item) => item.dataset.candybagItemId === bagId);
          lineItemToRemove.parentNode.removeChild(lineItemToRemove);

          // function to remove items from cart
          const itemsToRemove = items.filter((item) => {
            if (item.properties !== null) {
              if (Object.values(item.properties)[0] === bagId) return item;
            }
          });

          const obj = {};

          itemsToRemove.forEach((item) => {
            const id = item.key;
            obj[id] = 0;
          });

          changeSingleLineItem(obj, node);
          updateTotalPrices(node, cart);
        });
    });
  });

  /**
   * Change quantity of normal line-items
   */
  changeNormalLineItems(normalLineItems, node);

  /**
   * Change quantity of indiviadual items from candybag
   */
  changeCandyLineItems(candyItems, node);

  /**
   * Terms and purchase limit
   */
  const form = node.querySelector('[data-form]');
  const terms = node.querySelector('[data-terms]');
  const termsModal = node.querySelector('[data-terms-modal]');

  const termsModalHandler = () => {
    const accept = node.querySelector('[data-terms-accept]');
    const decline = node.querySelector('[data-terms-decline ]');

    accept.addEventListener('click', (e) => {
      e.preventDefault();
      termsModal.classList.add('is--hidden');
      terms.checked = true;
    });

    decline.addEventListener('click', (e) => {
      e.preventDefault();
      termsModal.classList.add('is--hidden');
    });
  };

  /**
   * Purchase limit
   */
  const purchaseLimitHandler = (e) => {
    const { cartTotal } = ctx.getState();
    ctx.emit('cart:updated', ({ cartTotal, event: e }));
  };

  ctx.on('cart:updated', (state) => {
    const { event } = state;
    const purchaseLimit = parseInt(node.dataset.purchaseLimit);
    const { cartTotal } = state;
    const limitModal = node.querySelector('[data-limit-modal]');
    const closeLimitModalButton = node.querySelector('[data-limit-close]');

    if (purchaseLimit >= cartTotal) {
      event.preventDefault();
      limitModal.classList.remove('is--hidden');

      closeLimitModalButton.addEventListener('click', (e) => {
        e.preventDefault();
        limitModal.classList.add('is--hidden');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    if (!terms.checked) {
      e.preventDefault();
      termsModal.classList.remove('is--hidden');
      termsModalHandler();
      return;
    }

    purchaseLimitHandler(e);
  });
});