/* ---------- SIDEBAR CONTROLS ---------- */
const sideBar = document.getElementById("sideBar");
const overlay = document.getElementById("sidebarOverlay");

function showsidebar() {
  sideBar.classList.add("active");
  overlay.classList.add("active");
}

function hideSideBar() {
  sideBar.classList.remove("active");
  overlay.classList.remove("active");
}

overlay.addEventListener("click", hideSideBar);

/* ---------- BACKGROUND HERO SLIDER ---------- */
const sliderWrapper = document.getElementById("sliderWrapper");
const slides = document.querySelectorAll("#sliderWrapper img");

let index = 0;

function autoSlide() {
  index++;

  if (index >= slides.length) {
    index = 0;
  }

  sliderWrapper.style.transform = `translateX(${-index * 100}%)`;
}

/* Auto slide every 6 seconds */
if (slides.length > 0) {
  setInterval(autoSlide, 6000);
}

/* Scroll behavior for Hero Button */
const heroBtn = document.querySelector(".hero-content button");
if (heroBtn) {
  heroBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector("#services");
    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: "smooth",
    });
  });
}

/* REMOVED .footer-top from this list so it loads normally */
const revealElements = document.querySelectorAll(
  ".us-card, .luxury-card, .section-header",
);

const observerOptions = {
  root: null,
  threshold: 0.15,
  rootMargin: "0px",
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

revealElements.forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

//furniture site
const swiper = new Swiper(".store-swiper", {
  loop: true,
  slidesPerView: 1.2,
  spaceBetween: 20,

  speed: 700, // ✅ smoother premium slide animation

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  breakpoints: {
    640: {
      slidesPerView: 2.2,
    },
    1024: {
      slidesPerView: 3.5,
    },
  },
});
