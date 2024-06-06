import { giveSpinner, removeSpinner } from "../utils/spinner";

const show_package = () => {
    document.querySelector('[data-drawer-cart--upsell]').setAttribute('opened', true);
    document.querySelector('.drawer-cart-inner').setAttribute('hide', true);
    document.querySelector('[data-drawer-back]').setAttribute('data-step', 1);

    let upsellHeaderHeight = document.querySelector(".drawer_header_shopAdjust").clientHeight;
    let upsellFooterHeight = document.querySelector(".drawer_footer_shopAdjust---upsell").clientHeight;
    let upsellTotalHeight = document.querySelector(".drawerContainer_shopAdjust").clientHeight;
    document.querySelector(".drawer_content_shopAdjust--upsell").style.height = `${upsellTotalHeight - (upsellHeaderHeight + upsellFooterHeight)}px`;

    // document.querySelector('[data-drawer-upsell]').innerHTML = 'videre';
    document.querySelector('[data-drawer-upsell]').querySelector('.btn-text').innerHTML = 'videre';
    document.querySelector('.sa-upsell-offer').setAttribute('opened', "true");
    document.querySelector('.sa-upsell-offer__detail').setAttribute('opened', "false");
    document.querySelector('[data-drawer-back]').setAttribute('data-step', 1);

    setTimeout(() => {
        removeSpinner(document.querySelector('[data-drawer-upsell'));
    }, 500);
}

const show_cross_sell = () => {
    document.querySelector('[data-drawer-cart--upsell]').setAttribute('opened', true);
    // document.querySelector('[data-drawer-upsell]').innerHTML = 'gå til betaling';
    document.querySelector('[data-drawer-upsell]').querySelector('.btn-text').innerHTML = 'gå til betaling';
    document.querySelector('[data-drawer-back]').setAttribute('data-step', 0);
    document.querySelector('.sa-upsell-offer').setAttribute('opened', "false");
    document.querySelector('.sa-upsell-offer__detail').setAttribute('opened', "true");

    setTimeout(() => {
        removeSpinner(document.querySelector('[data-drawer-upsell'));
    }, 500);
}

const go_to_checkout = () => {
    console.log('checkout now')
    // document.querySelector('#slidecart-checkout-form').submit();
    window.location.href = '/checkout';
    localStorage.setItem('checkout', true);
    setTimeout(() => {
        removeSpinner(document.querySelector('[data-drawer-upsell'));
    }, 500);
    
}

export default function beforeCheckout(cart_data, next = false) {
    let has_pkg = document.querySelectorAll('.sa-upsell-item') && document.querySelectorAll('.sa-upsell-item').length ? true : false ;
    let has_cross_sell = document.querySelectorAll('.sa-upsell-detail___item') && document.querySelectorAll('.sa-upsell-detail___item').length ? true : false ;

    // giveSpinner(document.querySelector('[data-drawer-upsell'));

    if(next && has_cross_sell) return show_cross_sell();
    if(next && !has_cross_sell) return go_to_checkout();

    const found = cart_data.items.find(cart => {
        if (cart.properties?.hasOwnProperty('ID') && cart.properties?.hasOwnProperty('Name') && cart.properties._is_gift != "true") {
            return cart
        }

        return false;
    });
   
    if (found && has_pkg ) {
        //show package
        console.log('show pkg');
        show_cross_sell();
        document.querySelector('.drawer-cart-inner').setAttribute('hide', true);
    }
    else if (!found && has_cross_sell) {
        console.log('show cross');
        show_cross_sell();
        document.querySelector('.drawer-cart-inner').setAttribute('hide', true);
    }
    else {
        console.log('go to checkout')
        //got to checkout 
        go_to_checkout();
    }
    //check if has cross_sell
    //check if has packages



}