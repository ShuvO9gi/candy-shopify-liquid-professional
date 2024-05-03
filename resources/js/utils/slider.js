import Swiper from '../lib/swiper-bundle.min.js';

function updateSlidesPerView() {
    const width = document.documentElement.clientWidth;

    let slidesPerView;
    if (width >= 1280) {
        slidesPerView = 7;
    } else if (width >= 1024) {
        slidesPerView = 4;
    } else if (width >= 768) {
        slidesPerView = 3;
    } else {
        slidesPerView = 2;
    }

    return slidesPerView;
}

export function createSwiper(node, id, enabled = false) {
    const swiper = new Swiper(node.querySelector(id), {
        direction: 'horizontal',
        loop: false,
        slidesPerView: updateSlidesPerView(),
        pagination: {
            el: '.swiper-pagination'
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        autoplay: {
            enabled: enabled,
            delay: 2000,
            disableOnInteraction: false,
        },
    });

    return swiper;
}
