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

//modal
function openProductModal(card) {
  const img = card.dataset.img;
  const badge = card.dataset.badge;
  const cat = card.dataset.cat;
  const title = card.dataset.title;
  const price = card.dataset.price;
  const desc = card.dataset.desc;
  const specs = card.dataset.specs ? JSON.parse(card.dataset.specs) : [];

  document.getElementById("modalImage").style.backgroundImage =
    "url('" + img + "')";

  const badgeEl = document.getElementById("modalTopBadges");
  badgeEl.innerHTML = badge
    ? '<span class="modal-badge">' + badge + "</span>"
    : "";

  document.getElementById("modalCategory").textContent = cat || "";
  document.getElementById("modalTitle").textContent = title || "";
  document.getElementById("modalPrice").textContent = price || "";
  document.getElementById("modalDesc").textContent = desc || "";

  const specsEl = document.getElementById("modalSpecs");
  if (specs.length) {
    specsEl.innerHTML = specs
      .map(function (s) {
        return (
          '<div class="spec-row"><span class="spec-label">' +
          s[0] +
          '</span><span class="spec-value">' +
          s[1] +
          "</span></div>"
        );
      })
      .join("");
    specsEl.style.display = "grid";
  } else {
    specsEl.style.display = "none";
  }

  document.getElementById("productModalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("productModalOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeProductModal();
});
