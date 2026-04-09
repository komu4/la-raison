const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".product-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");
    cards.forEach((card) => {
      if (filter === "all" || card.getAttribute("data-category") === filter) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

(function () {
  const overlay = document.getElementById("lrModal");
  const closeBtn = document.getElementById("lrModalClose");
  const modalImg = document.getElementById("lrModalImg");
  const modalTitle = document.getElementById("lrModalTitle");
  const modalDesc = document.getElementById("lrModalDesc");

  function openModal(img, title, desc) {
    modalImg.src = img;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    overlay.classList.add("lr-modal-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("lr-modal-open");
    document.body.style.overflow = "";
  }

  // Delegated click — works on Swiper's cloned slides too
  document.addEventListener("click", function (e) {
    const trigger = e.target.closest(".lr-modal-trigger");
    if (trigger) {
      e.preventDefault();
      openModal(
        trigger.dataset.img,
        trigger.dataset.title,
        trigger.dataset.desc,
      );
    }
  });

  closeBtn.addEventListener("click", closeModal);

  // Click outside the modal card closes it
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  // Escape key closes it
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
