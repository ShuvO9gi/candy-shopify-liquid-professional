import { component } from 'picoapp';
import { createSwiper } from '../utils/slider.js';

export default component((node, ctx) => {
    function openModal(modal) {
        modal.classList.add('is--visible')
    }

    function closeModal(modal) {
        modal.classList.remove('is--visible')
    }

    const candyBoxes = node.querySelectorAll('.candyBox');

    candyBoxes.forEach((candyBox) => {
        const productId = candyBox.getAttribute('data-product-id');
        const productTitle = candyBox.getAttribute('data-product-title');
        const modal = document.querySelector(`#modal-${productId}`);

        candyBox.querySelector('[data-info-icon]').onclick = function (e) {
            openModal(modal);
        };

        modal.querySelector('.close-modal').onclick = function (e) {
            closeModal(modal);
        };

        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('product', productTitle.toLowerCase());
        currentParams.set('select-product', true);
        const newUrl = `/collections/bland-selv-slik?${currentParams.toString()}`;

        candyBox.querySelector('.candyBoxImage').onclick = function (e) {
            window.location.href = newUrl;
        }

        candyBox.querySelector('.candyBoxBuyButton').onclick = function (e) {
            window.location.href = newUrl;
        }
    });

    createSwiper(node, '#swiper-homepage-products', false);
});
