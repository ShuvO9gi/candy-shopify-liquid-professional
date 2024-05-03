import app from '../../app';
import { formatMoney } from '../utils/currency';

export default function updateTotalPrices(node, cart) {
  const subtotalElem = node.querySelector('[data-subtotal]');
  const totalElem = node.querySelector('[data-total]');
  const { shippingPrice } = theme.settings;
  const subtotal = cart.items_subtotal_price;
  const total = cart.original_total_price + shippingPrice;

  app.hydrate({ cartTotal: total });

  subtotalElem.innerHTML = formatMoney(subtotal);
  totalElem.innerHTML = formatMoney(total);
}
