import { component } from 'picoapp';
import { fetchCart } from '../utils/cartFunctions';
import { giveSpinner } from '../utils/spinner';
import beforeCheckout from './upsellPage';

export default component((node, ctx) => {
    node.addEventListener('click', async(e) => {
        e.preventDefault();
        fetchCart().then(cart => {
            ctx.emit('cart:fired', cart)
            /*
            let back = document.querySelector('[data-drawer-back]')
            if (document.querySelector('.sa-upsell-offer').getAttribute('opened') == "true") {
                node.innerHTML = 'gå til betaling';
                back.setAttribute('data-step', 2);
                document.querySelector('.sa-upsell-offer').setAttribute('opened', "false");
                document.querySelector('.sa-upsell-offer__detail').setAttribute('opened', "true");
            }
            else {
                node.innerHTML = 'videre';
                document.querySelector('.sa-upsell-offer').setAttribute('opened', "true");
                document.querySelector('.sa-upsell-offer__detail').setAttribute('opened', "false");
                back.setAttribute('data-step', 1);

                let hh = document.querySelector(".drawer_footer_shopAdjust---upsell").clientHeight + 120;
                document.querySelector(".sa-upsell-wrapper").style.minHeight = `calc(100% - ${hh}px)`
            }*/
            if (document.querySelector('.sa-upsell-offer__detail').getAttribute('opened') == "true") {
                giveSpinner(node);
                // console.log('go to checkout --now')
                // document.querySelector('#slidecart-checkout-form').submit();
                window.location.href = '/checkout';
                localStorage.setItem('checkout', true);
            }
            else {
                // giveSpinner(node);
                beforeCheckout(cart, true);
            }
            
        })
        
        
    });
});
