import { component } from 'picoapp';
import { createSwiper } from '../utils/slider.js';

export default component((node, ctx) => {
    createSwiper(node, '#swiper-homepage-user-reviews', true);
});
