//filter btn
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".gallery-card");
const countEl = document.getElementById("results-count");
const noResults = document.getElementById("no-results");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    let visible = 0;
    cards.forEach((card) => {
      const matches =
        filter === "all" || card.getAttribute("data-category") === filter;
      if (matches) {
        card.style.display = "flex";
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, 10);
        visible++;
      } else {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        setTimeout(() => (card.style.display = "none"), 300);
      }
    });
    countEl.textContent = visible + " product" + (visible !== 1 ? "s" : "");
    noResults.style.display = visible === 0 ? "block" : "none";
  });
});

function showsidebar() {
  document.getElementById("sideBar").style.display = "flex";
  document.getElementById("sidebarOverlay").style.display = "block";
}
function hideSideBar() {
  document.getElementById("sideBar").style.display = "none";
  document.getElementById("sidebarOverlay").style.display = "none";
}

//modal
function openProductModal(card) {
  var img = card.dataset.img;
  var badge = card.dataset.badge;
  var cat = card.dataset.cat;
  var title = card.dataset.title;
  var price = card.dataset.price;
  var desc = card.dataset.desc;
  var specs = card.dataset.specs ? JSON.parse(card.dataset.specs) : [];

  document.getElementById("modalImage").style.backgroundImage =
    "url('" + img + "')";
  var badgeEl = document.getElementById("modalTopBadges");
  badgeEl.innerHTML = badge
    ? '<span class="modal-badge">' + badge + "</span>"
    : "";
  document.getElementById("modalCategory").textContent = cat || "";
  document.getElementById("modalTitle").textContent = title || "";
  document.getElementById("modalPrice").textContent = price || "";
  document.getElementById("modalDesc").textContent = desc || "";

  var specsEl = document.getElementById("modalSpecs");
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
