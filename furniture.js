AOS.init({
  once: true,
  offset: 100,
  duration: 800,
  easing: "ease-out-cubic",
});

//modal
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

//blog
(function () {
  // ⚠️ REPLACE THESE WITH YOUR REAL VALUES
  const SANITY_PROJECT_ID = "z6db0zm1";
  const SANITY_DATASET = "production";

  const query = encodeURIComponent(`
    *[_type == "post"] | order(publishedAt desc) [0..2] {
      title,
      slug,
      tag,
      excerpt,
      publishedAt,
      "imageUrl": mainImage.asset->url
    }
  `);

  const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderCard(post, delay) {
    const slug = post.slug?.current || "#";
    const href = `article.html?slug=${slug}`;
    const date = post.publishedAt ? formatDate(post.publishedAt) : "";
    const imgSrc = post.imageUrl
      ? `${post.imageUrl}?w=800&q=80&auto=format`
      : "images/la raison.jpg";
    return `
      <article class="blog-card" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="blog-img-wrapper">
          <img src="${imgSrc}" alt="${post.title}" loading="lazy">
          <span class="blog-tag">${post.tag || ""}</span>
        </div>
        <div class="blog-content">
          <span class="blog-date">${date}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt || ""}</p>
          <a href="${href}" class="blog-link">Read More <i class="fa-solid fa-arrow-right-long"></i></a>
        </div>
      </article>`;
  }

  function renderError(grid) {
    grid.innerHTML = `
      <div class="blog-error">
        <p>Could not load posts. <a href="furniture-articles.html">View all posts →</a></p>
      </div>`;
  }

  async function loadBlogPosts() {
    const grid = document.getElementById("blog-grid");
    if (!grid) return;
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(res.status);
      const { result } = await res.json();
      if (!result || result.length === 0) {
        renderError(grid);
        return;
      }
      grid.innerHTML = result
        .map((p, i) => renderCard(p, [100, 200, 300][i] || 100))
        .join("");
      if (typeof AOS !== "undefined") AOS.refresh();
    } catch (err) {
      console.error("Blog fetch failed:", err);
      renderError(grid);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadBlogPosts);
  } else {
    loadBlogPosts();
  }
})();
