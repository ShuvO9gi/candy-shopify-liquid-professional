export default function countDown(node) {
  (function () {
    const limitHrs = parseInt(node.dataset.limitHrs);
    const timeElems = document.querySelectorAll('.time-countdown');
    
    const {
      hours, hour, minutes, minute,
    } = theme.strings.header.topbar;

    const start = new Date();
    start.setHours(limitHrs, 0, 0); // 6pm

    //console.log([start, limitHrs])

    function pad(num) {
      return (`0${parseInt(num)}`).substr(-2);
    }

    function tick() {
      const now = new Date();

      

      if (now > start) { // too late, go to tomorrow
        start.setDate(start.getDate() + 1);
      }

      const remain = ((start - now) / 1000);
      let hh = pad((remain / 60 / 60) % 60);
      let mm = pad((remain / 60) % 60);

      if (hh.length > 1) {
        if (hh === '20' || hh === '10') {
          hh = `${hh} ${hours}`;
        } else {
          hh = `${hh.replace('0', '')} ${hours}`;
        }
      } else {
        hh = `${hh} ${hour}`;
      }

      if (mm === '01') {
        mm = `${mm} ${minute}`;
      } else {
        mm = `${mm} ${minutes}`;
      }

      timeElems.forEach(timeElem => {
        if (timeElem) {
          timeElem.innerHTML = `${hh} og ${mm}`;
        }
      })
      
      setTimeout(tick, 1000);
    }

    document.addEventListener('DOMContentLoaded', tick);
  }());
}
