import { component } from 'picoapp';
import { Liquid } from 'liquidjs';  
import { moneyFiltersPlugin } from '../modules/filterliquid';
import { createProperties, fetchCart, updateLineItem } from '../utils/cartFunctions';
const engine = new Liquid();
engine.plugin(moneyFiltersPlugin);

export default component((node, ctx) => {
    let cart = ctx.getState().cart;

    ctx.on('drawer:upsell', ({cart}) => {
        ctx.hydrate({ cart: cart });
    });

    ctx.on("*", state => {
        /*
        let c = state.cart;
        if (cart.item_count != c.item_count || cart.total_price != c.total_price) {
            cart = c;
            updateCart(c);
        }
        */
        cart = state.cart;
        updateCart(cart);
    }); 

    const subtotal_el = document.querySelector('[data-original-total-price--upsell]');
    const shipping_el = document.querySelector('[data-original-total-shipping--upsell]');

    const clear = async () => {
        let items = document.querySelectorAll('.sa-upsell-item');
        for await (const item of items) {
            item.classList.remove('selected');
        }
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

    const get_poses = (cart) => {
        let ps = [];
        cart.items.forEach(item => {
            if (item?.properties?.ID && !ps.includes(item.properties.ID)) {
                ps.push(item.properties.ID)
            }
        });

        return ps;
    }

    const calculate = (product) => {
        let total_price = 0;
        const found = cart.items.find(item => item.id == product.id);
        const poses = get_poses(cart);


        if (!found) {
            total_price = cart.total_price + (poses.length * product.price)
        }
        
        return total_price;
    }

    const updateTotal = (carts) => {
        const {total_price} = carts
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
    }

    const updateCart = async (carts) => {
        // const { total_price } = carts;
        const poses  = get_poses(carts);
        
        if (poses.length > 0) {
            let items = document.querySelectorAll('.sa-upsell-item');
            let first = true;
            for await (const item of items) {
                let json = item.querySelector('script').textContent;
                const product = JSON.parse(json);
                const found = carts.items.find(item => {
                    return product.variants.find(variant => item.id == variant.id);
                });
    
                if (found) {
                    first = false;
                    item.classList.add('selected');
                    item.querySelector('[type="radio"]').checked = true;
                    if (poses.length != found.quantity) {
                        let objs = {};
                        objs[found.id] = poses.length;
                        
                        updateLineItem(objs).then(data => {
                            return data
                        }).then((data) => updateTotal(data));
                        
                    }
                }
                else {
                    item.classList.remove('selected');
                    item.querySelector('[type="radio"]').checked = false;
                }
    
                engine.parseAndRender("+ {{pkg_price  | money : cart.currency}}. i alt", {
                    cart: carts,
                    pkg_price: poses.length * (product.price / 100)
                }).then(html => document.querySelector('[data-pkg-price]').innerHTML = html);                
            }
            
            if (first) {
                items[0].classList.add('selected');
                items[0].querySelector('[type="radio"]').checked = true;
            }
        }
        else {
            const t = async () => {
                await cleart_cart(carts);
            }

            t().then(() => {
                updateTotal(carts)
            })
        }

        
    };

    const cleart_cart = async (carts) => {
        let addToCart = true;
        for await (const item of document.querySelectorAll('.sa-upsell-item')) {
            let json = item.querySelector('script').textContent;
            const product = JSON.parse(json);
            const found = carts.items.find(item => {
                return product.variants.find(variant => item.id == variant.id);
            });

            if (found) {
                //delete 
                await _delete(found);
            }

        }

        return addToCart;
    }

    const canAddTocart = async (_product, parent, carts) => {
        let addToCart = true;
        const poses  = get_poses(carts);
        for await (const item of parent.querySelectorAll('.sa-upsell-item')) {
            let json = item.querySelector('script').textContent;
            const product = JSON.parse(json);
            const found = carts.items.find(item => {
                return product.variants.find(variant => item.id == variant.id);
            });

            if (found && product.id == _product.id) {
                if (poses.length != found.quantity) {
                    let objs = {};
                    objs[found.id] = poses.length;
                    updateLineItem(objs).then(data => {
                        ctx.emit('cart:fired', {cart: data})
                    })
                }
                else {
                    addToCart = false;
                }
                
                addToCart = false;
            }
            else if (found && product.id != _product.id) {
                //delete 
                await _delete(found);
            }

        }

        return addToCart;
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

    node.addEventListener('click', async(e) => {
        e.preventDefault();
        
        await clear().then(() => {
            node.querySelector('[type="radio"]').checked = true;
        }).then(() => {
            node.classList.add('selected');
        }).then(() => {
            let _json = node.querySelector('script').textContent;
            const _product = JSON.parse(_json)
            /*
            
            const total_price = calculate(product);
            updateCart(total_price);
            */
            
            fetchCart().then(async (carts) => {
                const poses  = get_poses(carts);
                const parent = node.closest('.sa-upsell-items');

                let addToCart = await canAddTocart(_product, parent, carts);
                
                if (addToCart) {
                    let json = node.querySelector('script').textContent;
                    const product = JSON.parse(json);
                    let formData = createProperties({
                        product : product['variants'][0].id,
                        quantity: poses.length,
                        properties : {
                            name: 'Pak', 
                            value: true 
                        }
                    });

                    // console.log('name=upsell ---added')
                    show_loader(true, node.closest('.sa-upsell-offer'));

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
                    .then(() => {
                        fetchCart().then((latest_cart) => {
                            ctx.emit('drawer:upsell', {cart: latest_cart})
                        }).then(() => show_loader(false, node.closest('.sa-upsell-offer')))
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        show_loader(false, node.closest('.sa-upsell-offer'));
                    });
                }
                else {
                    show_loader(true, node.closest('.sa-upsell-offer'));
                    fetchCart().then((latest_cart) => {
                        ctx.emit('drawer:upsell', {cart: latest_cart})
                    }).then(() => show_loader(false, node.closest('.sa-upsell-offer')))
                }
                
            });
        })
        
    });
});
