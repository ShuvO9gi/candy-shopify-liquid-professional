//product-slider section
var swiper = new Swiper(".productSwiperSlider", {
        slidesPerView: 4,
        spaceBetween: 20,
        loop:true,
        navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
      breakpoints: {
        340: {
        slidesPerView: 1,
      },
      640: {
        slidesPerView: 1,
      },
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 4,
      }
    }
    });



$(document).ready(function() {
  // Add click event listener to .candyBox element
  $(".productSwiperSlider .candyBox").on("click", function() {
    var productUrl = $(this).attr("data-product-url"); 
    window.location.href = productUrl;
  });
});

  $(".hero_productSlickSlider").slick({
   slidesToShow: 3,
   infinite:false,
   slidesToScroll: 1,
   autoplay: false,
    arrows: false,
     responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite:true,
        dots: true
      }
    }
  ]
  });
