const productSwiper = new Swiper(".product-slider", {
  slidesPerView: "auto",
  spaceBetween: 18,

  loop: true,
  loopAdditionalSlides: 6,
  slidesPerGroup: 1,

  speed: 1400, // default (autoplay + drag)

  grabCursor: true,

  autoplay: {
    delay: 10000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
    waitForTransition: true,
  },

  navigation: {
    nextEl: ".product-nav.next",
    prevEl: ".product-nav.prev",
  },

  simulateTouch: true,
  followFinger: true,
  resistanceRatio: 0.8,

  breakpoints: {
    0: { slidesPerView: 1.2 },
    600: { slidesPerView: 2.2 },
    900: { slidesPerView: "auto" },
  },
});

// 🚀 Faster arrow swipe (but still smooth)
const ARROW_SPEED = 850;

document.querySelector(".product-nav.next").addEventListener("click", () => {
  productSwiper.params.speed = ARROW_SPEED;
  productSwiper.slideNext();
  productSwiper.params.speed = 1400;
});

document.querySelector(".product-nav.prev").addEventListener("click", () => {
  productSwiper.params.speed = ARROW_SPEED;
  productSwiper.slidePrev();
  productSwiper.params.speed = 1400;
});
