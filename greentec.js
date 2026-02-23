const productSwiper = new Swiper(".product-slider", {
  // Basic Layout
  slidesPerView: 1.2,
  spaceBetween: 20,
  loop: true,
  grabCursor: true,

  autoplay: {
    delay: 6000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },

  // Smoothness Settings
  speed: 1000, // Takes 1 second to transition (feels premium)

  // Navigation & Pagination
  navigation: {
    nextEl: ".product-nav.next",
    prevEl: ".product-nav.prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
  },

  // Responsive Breakpoints
  breakpoints: {
    640: {
      slidesPerView: 2.2,
      spaceBetween: 25,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
    1200: {
      slidesPerView: 4,
      spaceBetween: 30,
    },
  },
});

function viewAll() {
  document.querySelectorAll(".hideRow").forEach((row) => {
    row.classList.add("show-row");
  });
}
