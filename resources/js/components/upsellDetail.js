import { component } from 'picoapp';
import { Liquid } from 'liquidjs';  
import { moneyFiltersPlugin } from '../modules/filterliquid';
import { createProperties, fetchCart, updateLineItem } from '../utils/cartFunctions';
import debounce from '../utils/debounce';

const engine = new Liquid();
engine.plugin(moneyFiltersPlugin);

const clear = async () => {
//     let items = document.querySelectorAll('.sa-upsell-detail___item');
//     for await (const item of items) {
//         item.classList.remove('selected');
//     }
}

export default component((node, ctx) => {
    const { cart } = ctx.getState();
    
    ctx.on('*', ({cart}) => {
        updateCart(cart);
    });

    const subtotal_el = document.querySelector('[data-original-total-price--upsell]');
    const shipping_el = document.querySelector('[data-original-total-shipping--upsell]');

    const updateCart = (carts) => {
        const { total_price } = carts;
        for (const item of document.querySelectorAll('.sa-upsell-detail___item')) {
            let json = item.querySelector('script').textContent;
            const product = JSON.parse(json);
            const found = carts.items.find(item => {
                return product.variants.find(variant => item.id == variant.id);
            });

            if (found) {
                item.classList.add('selected');
                item.querySelector('[type="checkbox"]').checked = true;

                item.querySelector('[data-current-qty]').innerHTML = found.quantity;
                item.querySelector('[data-current-qty]').setAttribute('data-key', found.id);
                item.querySelector('[data-current-qty]').setAttribute('data-qty', found.quantity);
                
            }
            else {
                item.classList.remove('selected');
                item.querySelector('[type="checkbox"]').checked = false;

                item.querySelector('[data-current-qty]').innerHTML = 0;
                item.querySelector('[data-current-qty]').setAttribute('data-key', "");
                item.querySelector('[data-current-qty]').setAttribute('data-qty', 0);
            }
            
        }

        const { shippingPrice, shippingPriceLimit } = theme.settings;
               
        let shipping_amount = shippingPrice
        if (total_price > shippingPriceLimit || cart.item_count <= 0) shipping_amount = 0;

        const total = total_price + shipping_amount;

        engine.parseAndRender('{{total | divided_by: 100 | money : cart.currency }}', {
            cart: cart,
            total: total_price
        }).then(html => subtotal_el.innerHTML = html);

        engine.parseAndRender('{{shippingPrice | divided_by: 100  | money : cart.currency }}', {
            cart: cart,
            shippingPrice: shipping_amount
        }).then(html => shipping_el.innerHTML = html);

        if (document.querySelector('[data-original-total-grand-total--upsell]')) {
            engine.parseAndRender('{{total | money : cart.currency}}', {total : total / 100 , cart }).then(html => {
                document.querySelector('[data-original-total-grand-total--upsell]').innerHTML = html;
            })
        }
    };

    const canAddTocart = async (_product, parent, carts) => {
        let addToCart = true;
        for await (const item of parent.querySelectorAll('.sa-upsell-detail___item')) {
            let json = item.querySelector('script').textContent;
            const product = JSON.parse(json);
            const found = carts.items.find(item => {
                return product.variants.find(variant => item.id == variant.id);
            });
            if (found && product.id == _product.id) {
                addToCart = false;
            }
            else if (found && product.id != _product.id) {
                //delete 
                // await _delete(found);
            }
        }

        return addToCart;
    }

    const show_loader = (show, doc = content_items) => {
        if (doc.querySelector(".drawer_loading") == null && show) {
            const elm = document.createElement('div');
            elm.classList.add("drawer_loading")
            doc.prepend(elm);
        }
        else {
            doc.querySelectorAll(".drawer_loading").forEach(e => e.remove());
        }
    }

    const _delete = async (found) => {
        let obj = {};
        obj[found.id] = 0;
        let response =  await fetch('/cart/update.js', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ updates: obj }),
        });

        let data = await response.json();
        // only proceed once second promise is resolved
        return data;
    }

    let objs = {};
    node.querySelector('[data-qty-minus]').addEventListener('click', async (e) => {
        e.preventDefault();
        const item = node.querySelector('[data-current-qty]');
        const itemId = item.dataset.key;
        const currentQuantity = item.dataset.qty;
        objs[itemId] =  Number(currentQuantity) - 1;

        if (objs[itemId] <= 0) {
            objs[itemId] = 0;
        }

        node.querySelector('[data-current-qty]').innerHTML = objs[itemId];
        item.dataset.qty = objs[itemId];
    });

    node.querySelector('[data-qty-plus]').addEventListener('click', async (e) => {
        e.preventDefault();
        const item = node.querySelector('[data-current-qty]');
        const itemId = item.dataset.key;
        const currentQuantity = item.dataset.qty;
        objs[itemId] = Number(currentQuantity) + 1;

        node.querySelector('[data-current-qty]').innerHTML = objs[itemId];
        item.dataset.qty = objs[itemId];
    });

    node.querySelector('[data-qty-minus]').addEventListener('click', debounce(function () {
        updateLineItem(objs).then(data => {
            ctx.emit('cart:fired', {cart: data})
        })
    }, 500))

    node.querySelector('[data-qty-plus]').addEventListener('click', debounce(function () {
        updateLineItem(objs).then(data => {
            ctx.emit('cart:fired', {cart: data})
        })
    }, 500))

    node.querySelectorAll('[data-button-sa-buy]').forEach(buy => {
        buy.addEventListener('click', async (e) => {
            e.preventDefault();
            await clear().then(() => {
                node.querySelector('[type="checkbox"]').checked = true;
            }).then(() => {
                node.classList.add('selected');
            })
            .then(() => {
                let _json = node.querySelector('script').textContent;
                const _product = JSON.parse(_json)
                fetchCart().then(async (carts) => {
                    const poses = carts.items.filter(item => item?.properties?.ID);
                    const parent = node.closest('.sa-upsell-offer__detail__items');
                    let addToCart = await canAddTocart(_product, parent, carts);
                    if (addToCart) {
                        let json = node.querySelector('script').textContent;
                        const product = JSON.parse(json);
                        let formData = createProperties({
                            product : product['variants'][0].id,
                            quantity: 1,
                            properties : {
                                Name: `${product.title}`, // Product title
                                ID: "",
                                name: 'hot-deals', 
                                value: true 
                            }
                        });
    
                        show_loader(true, node.closest('.sa-upsell-offer__detail__items'))
                        fetch('/cart/add.js', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })
                        .then(response => {
                            return response.json();
                        })
                        .then((res) => {
                            let p = res.items[0];
                            node.querySelector('[data-current-qty]').innerHTML = p.quantity;
                            node.querySelector('[data-current-qty]').setAttribute('data-key', p.id);
                            node.querySelector('[data-current-qty]').setAttribute('data-qty', p.quantity);
                            fetchCart().then((latest_cart) => {
                                ctx.emit('cart:fired', {cart: latest_cart})
                            });
    
                            show_loader(false, node.closest('.sa-upsell-offer__detail__items'))
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            show_loader(false, node.closest('.sa-upsell-offer__detail__items'))
                        });
                    }
                    else {
                        fetchCart().then((latest_cart) => {
                            ctx.emit('cart:fired', {cart: latest_cart})
                        });
                    }
                    
                });
            })
        });  
    })
});
