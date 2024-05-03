import { component } from 'picoapp';
import headerScroll from '../components/headerScroll';
// import handleMobileIconSize from '../components/handleMobileIconSize';
import scrollToTop from '../components/scrollToTop';
import countDown from '../components/countDown';
import mobileMenu from '../components/mobileMenu';

export default component((node) => {
  headerScroll(node);
  // handleMobileIconSize(node);
  scrollToTop();
  countDown(node);
  mobileMenu(node);
});
