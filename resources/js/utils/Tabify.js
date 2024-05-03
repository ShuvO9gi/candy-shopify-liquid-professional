class Tabify {
  constructor(toggles, tabs, icons, openFirst = false) {
    this.toggles = toggles;
    this.tabs = tabs;
    this.icons = icons;
    this.openFirst = openFirst;

    this.toggleHandler();
    this.openFirstTab();
  }

  openFirstTab() {
    if (this.openFirst) {
      this.tabs[0].style.maxHeight = `${this.tabs[0].scrollHeight}px`;

      if (this.icons[0] != undefined) {
        this.icons[0].classList.add('transform', 'rotate-180');
      }
    }
  }

  toggleHandler() {
    this.toggles.forEach((toggle, i) => {
      toggle.addEventListener('click', () => {
        if (this.tabs[i].style.maxHeight) {
          this.tabs[i].style.maxHeight = null;
          toggle.classList.remove('open');

          if (this.icons != undefined) {
            this.icons[i].classList.remove('transform', 'rotate-180');
          }
        } else {
          this.tabs.forEach((tab) => {
            tab.style.maxHeight = null;
          });

          this.toggles.forEach((toggle) => {
            toggle.classList.remove('open');
          });

          if (this.icons != undefined) {
            this.icons.forEach((icon) => {
              icon.classList.remove('transform', 'rotate-180');
            });
          }

          if (this.icons != undefined) {
            this.icons[i].classList.add('transform', '-rotate-180');
          }

          this.tabs[i].style.maxHeight = `${this.tabs[i].scrollHeight}px`;
          toggle.classList.add('open');
        }
      });
    });
  }
}

export default Tabify;
