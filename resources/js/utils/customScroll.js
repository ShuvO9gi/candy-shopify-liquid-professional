class CustomScroll {
  constructor(container, scrollBar) {
    // DOM elements
    this.container = container;
    this.scrollBar = scrollBar;

    // Variables
    this.containerHeight = this.container.scrollHeight;
    this.enableScroll = this.container.scrollHeight > this.container.clientHeight;

    // Methods
    this.createScrollThumb();
  }

  createScrollThumb() {
    if (this.enableScroll) {
      // Show scrollbar
      this.scrollBar.classList.add('is--visible');

      // Create thumb element
      const thumb = document.createElement('div');
      // Get the correct height (1/4 of the container)
      const thumbHeight = this.containerHeight * 0.15;

      // Set the height of the thumb
      thumb.style.height = `${thumbHeight}px`;
      // Give thumb a class
      thumb.classList.add('custom-scrollbar-thumb', 'rounded-full');

      // Append thumb to custom scrollbar
      this.scrollBar.appendChild(thumb);

      // Init scrollHandler
      this.scrollHandler(thumb);
    }
  }

  scrollHandler(thumb) {
    this.container.addEventListener('scroll', () => {
      if (this.container.scrollHeight > this.container.clientHeight) {
        const scrollPos = this.container.scrollTop;
        const height = this.container.scrollHeight - this.container.clientHeight;
        const scrolled = (scrollPos / height) * 100;
        const fraction = this.scrollBar.offsetHeight / thumb.offsetHeight;
        const translateVal = scrolled * (fraction - 1);

        thumb.style.transform = `translateY(${translateVal}%)`;
      }
    });
  }
}

export default CustomScroll;
