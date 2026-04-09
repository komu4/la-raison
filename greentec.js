/* greentec.js — La Raison GreenTec */

document.addEventListener("DOMContentLoaded", () => {
  /* ── Mobile nav toggle ───────────────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      hamburger.setAttribute(
        "aria-expanded",
        navLinks.classList.contains("open"),
      );
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  /* ── Scroll reveal ───────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    ".benefit-item, .feature-card, .stat-box",
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
      observer.observe(el);
    });
  }

  /* ── Navbar shadow on scroll ─────────────────────────── */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 10
          ? "0 4px 20px rgba(0,0,0,0.15)"
          : "0 2px 12px rgba(0,0,0,0.1)";
    });
  }

  /* ── Product Swiper ──────────────────────────────────── */
  if (document.querySelector(".product-slider")) {
    new Swiper(".product-slider", {
      slidesPerView: 1.15,
      spaceBetween: 16,
      centeredSlides: false,
      grabCursor: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        prevEl: ".product-nav.prev",
        nextEl: ".product-nav.next",
      },
      breakpoints: {
        520: { slidesPerView: 1.6, spaceBetween: 20 },
        768: { slidesPerView: 2.4, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 28 },
      },
    });
  }

  /* ── Modal: close button ─────────────────────────────── */
  const overlay = document.getElementById("productModalOverlay");
  const closeBtn = document.getElementById("modalClose");

  if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
  if (overlay)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeProductModal();
    });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });
});

/* ── Modal open/close (global) ───────────────────────────── */
function openProductModal(article) {
  const overlay = document.getElementById("productModalOverlay");
  if (!overlay) return;

  const img = article.dataset.img || "";
  const badge = article.dataset.badge || "";
  const cat = article.dataset.cat || "";
  const title = article.dataset.title || "";
  const price = article.dataset.price || "";
  const desc = article.dataset.desc || "";
  const specs = JSON.parse(article.dataset.specs || "[]");

  document.getElementById("modalImg").style.backgroundImage = `url('${img}')`;
  document.getElementById("modalCat").textContent = cat;
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalPrice").innerHTML = price;
  document.getElementById("modalDesc").textContent = desc;

  // Badge
  const badgeWrap = document.getElementById("modalBadgeWrap");
  badgeWrap.innerHTML = badge
    ? `<span class="product-badge${badge === "New" ? " new-badge" : ""}">${badge}</span>`
    : "";

  // Specs table
  const table = document.getElementById("modalSpecs");
  table.innerHTML = specs
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");

  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const overlay = document.getElementById("productModalOverlay");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

/* ============================================================
   SANITY CMS — Blog / Articles Integration
   ============================================================

   HOW TO CONFIGURE:
   1. Go to sanity.io, create a project, get your Project ID
   2. Replace SANITY_PROJECT_ID below with your actual project ID
   3. Set SANITY_DATASET to "production" (default) or your dataset
   4. Make sure your Sanity schema has a "post" document type with:
        - title (string)
        - slug (slug)
        - mainImage (image with asset ref)
        - excerpt (text)
        - publishedAt (datetime)
        - categories[]->(title string)
        - body (block content / portable text)
        - author -> { name, image }
   ============================================================ */

const SANITY_PROJECT_ID = "n93vwln4"; // ← Replace this
const SANITY_DATASET = "production";
const SANITY_API_VER = "2024-01-01";

/**
 * Build a Sanity CDN image URL from an asset reference.
 * ref format: "image-abc123-1200x800-jpg"
 */
function sanityImgUrl(ref, width = 800) {
  if (!ref) return null;
  const [, id, dimensions, fmt] = ref.split("-");
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${fmt}?w=${width}&auto=format`;
}

/**
 * Run a GROQ query against Sanity's CDN API.
 */
async function sanityFetch(query, params = {}) {
  const encoded = encodeURIComponent(query);
  const paramStr = Object.entries(params)
    .map(([k, v]) => `&$${k}=${encodeURIComponent(JSON.stringify(v))}`)
    .join("");
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}?query=${encoded}${paramStr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
  const json = await res.json();
  return json.result;
}

/**
 * Format a date string to "DD Month YYYY".
 */
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Render a single blog card element.
 */
function renderBlogCard(post, featured = false) {
  const imgRef = post.mainImage?.asset?._ref;
  const imgUrl = imgRef ? sanityImgUrl(imgRef, 700) : null;
  const category = post.categories?.[0]?.title || "Article";
  const slug = post.slug?.current || post._id;
  const date = formatDate(post.publishedAt);

  const card = document.createElement("a");
  card.className = "blog-card";
  card.href = `article.html?slug=${encodeURIComponent(slug)}`;

  card.innerHTML = `
        <div class="card-image">
            ${
              imgUrl
                ? `<img src="${imgUrl}" alt="${post.title}" loading="lazy">`
                : `<div class="card-image-placeholder"><i class="fa-solid fa-solar-panel"></i></div>`
            }
        </div>
        <div class="card-body">
            <span class="card-category">${category}</span>
            <h3 class="card-title">${post.title}</h3>
            <p class="card-excerpt">${post.excerpt || ""}</p>
            <div class="card-meta">
                <span class="card-date">${date}</span>
                <span class="card-read-more">Read <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `;
  return card;
}

/**
 * Load latest 3 posts into the homepage blog grid.
 */
async function loadHomepageBlog() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  // If no project ID configured, show demo cards
  if (SANITY_PROJECT_ID === "YOUR_PROJECT_ID") {
    grid.innerHTML = "";
    const demoPosts = getDemoPosts(3);
    demoPosts.forEach((p) => grid.appendChild(renderDemoCard(p)));
    return;
  }

  try {
    const query = `*[_type == "post"] | order(publishedAt desc) [0..2] {
            _id, title, slug, excerpt, publishedAt,
            mainImage { asset { _ref } },
            categories[]->{ title }
        }`;
    const posts = await sanityFetch(query);
    grid.innerHTML = "";
    if (!posts || posts.length === 0) {
      grid.innerHTML = `<div class="blog-error">
                <i class="fa-solid fa-newspaper"></i>
                <p>No articles published yet. Check back soon!</p>
            </div>`;
      return;
    }
    posts.forEach((p) => grid.appendChild(renderBlogCard(p)));
  } catch (err) {
    console.warn("Sanity blog load error:", err);
    grid.innerHTML = `<div class="blog-error">
            <i class="fa-solid fa-circle-exclamation"></i>
            <p>Could not load articles right now. Please try again later.</p>
        </div>`;
  }
}

/* ── Demo / fallback posts (shown before Sanity is configured) ─ */
function getDemoPosts(count = 6) {
  const posts = [
    {
      id: 1,
      slug: "solar-installation-abuja",
      category: "Installation",
      title: "How We Installed a 10kWh Solar System for a Family in Abuja",
      excerpt:
        "A step-by-step look at our latest residential project — from roof survey to final sign-off — and how we cut the client's energy bill by 85%.",
      date: "March 15, 2025",
      icon: "fa-solar-panel",
    },
    {
      id: 2,
      slug: "lithium-vs-lead-acid",
      category: "Education",
      title: "Lithium vs Lead-Acid Batteries: What's Right for Your Home?",
      excerpt:
        "We break down the real differences in cost, lifespan, and performance to help Nigerian homeowners make the best battery storage decision.",
      date: "February 28, 2025",
      icon: "fa-battery-full",
    },
    {
      id: 3,
      slug: "industrial-solar-kano",
      category: "Case Study",
      title:
        "Industrial Solar Case Study: Powering a Cold Chain Facility in Kano",
      excerpt:
        "A 50kVA off-grid system designed to keep temperature-sensitive goods safe 24/7 — even during 12-hour NEPA outages.",
      date: "January 10, 2025",
      icon: "fa-industry",
    },
    {
      id: 4,
      slug: "net-metering-nigeria",
      category: "Policy",
      title:
        "Net Metering in Nigeria: What the New NERC Guidelines Mean for You",
      excerpt:
        "The regulator has opened the door for grid-tied solar owners to sell excess power. Here's what you need to know and how to prepare.",
      date: "December 5, 2024",
      icon: "fa-chart-line",
    },
    {
      id: 5,
      slug: "roof-survey-guide",
      category: "Guide",
      title: "5 Things Our Engineers Check During Every Roof Survey",
      excerpt:
        "Not all rooftops are created equal. Our certified engineers explain the structural, orientation, and shading factors that determine your system design.",
      date: "November 20, 2024",
      icon: "fa-house-chimney",
    },
    {
      id: 6,
      slug: "monitoring-system",
      category: "Technology",
      title: "Real-Time Monitoring: How We Keep an Eye on Your System Remotely",
      excerpt:
        "Our smart monitoring portal lets clients and engineers track energy production, battery health, and consumption from anywhere in the world.",
      date: "October 8, 2024",
      icon: "fa-microchip",
    },
  ];
  return posts.slice(0, count);
}

function renderDemoCard(post) {
  const card = document.createElement("a");
  card.className = "blog-card";
  card.href = `article.html?slug=${post.slug}&demo=true`;
  card.innerHTML = `
        <div class="card-image">
            <div class="card-image-placeholder"><i class="fa-solid ${post.icon}"></i></div>
        </div>
        <div class="card-body">
            <span class="card-category">${post.category}</span>
            <h3 class="card-title">${post.title}</h3>
            <p class="card-excerpt">${post.excerpt}</p>
            <div class="card-meta">
                <span class="card-date">${post.date}</span>
                <span class="card-read-more">Read <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `;
  return card;
}

/* ── Articles page (articles.html) ──────────────────────── */
async function loadArticlesPage() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = Array(6)
    .fill("")
    .map(
      () => `
        <div class="blog-card skeleton-card">
            <div class="card-image skeleton-image"></div>
            <div class="card-body">
                <div class="skeleton-line narrow"></div>
                <div class="skeleton-line wide"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line narrow"></div>
            </div>
        </div>
    `,
    )
    .join("");

  if (SANITY_PROJECT_ID === "YOUR_PROJECT_ID") {
    grid.innerHTML = "";
    getDemoPosts(6).forEach((p) => grid.appendChild(renderDemoCard(p)));
    setupFilters(grid);
    return;
  }

  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
            _id, title, slug, excerpt, publishedAt,
            mainImage { asset { _ref } },
            categories[]->{ title }
        }`;
    const posts = await sanityFetch(query);
    grid.innerHTML = "";
    if (!posts || posts.length === 0) {
      grid.innerHTML = `<div class="blog-error">
                <i class="fa-solid fa-newspaper"></i>
                <p>No articles published yet. Check back soon!</p>
            </div>`;
      return;
    }
    posts.forEach((p, i) => grid.appendChild(renderBlogCard(p, i === 0)));
    setupFilters(grid);
  } catch (err) {
    console.warn("Sanity articles load error:", err);
    grid.innerHTML = `<div class="blog-error">
            <i class="fa-solid fa-circle-exclamation"></i>
            <p>Could not load articles. Please try again later.</p>
        </div>`;
  }
}

function setupFilters(grid) {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      grid.querySelectorAll(".blog-card").forEach((card) => {
        if (cat === "all") {
          card.style.display = "";
        } else {
          const cardCat =
            card.querySelector(".card-category")?.textContent?.toLowerCase() ||
            "";
          card.style.display = cardCat.includes(cat.toLowerCase())
            ? ""
            : "none";
        }
      });
    });
  });
}

/* ── Single article page (article.html) ─────────────────── */
async function loadSingleArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const isDemo = params.get("demo") === "true";

  const heroEl = document.getElementById("article-hero");
  const bodyEl = document.getElementById("article-body");
  const sideEl = document.getElementById("article-sidebar");

  if (!slug || !heroEl || !bodyEl) return;

  // Demo article content
  if (isDemo || SANITY_PROJECT_ID === "YOUR_PROJECT_ID") {
    const demo =
      getDemoPosts(6).find((p) => p.slug === slug) || getDemoPosts(1)[0];
    renderArticleHero(heroEl, {
      title: demo.title,
      category: demo.category,
      publishedAt: demo.date,
      author: "La Raison GreenTec Team",
      readTime: "5 min read",
      mainImage: null,
    });
    renderArticleBody(bodyEl, getDemoArticleBody(demo));
    if (sideEl)
      renderArticleSidebar(
        sideEl,
        getDemoPosts(3).filter((p) => p.slug !== slug),
      );
    return;
  }

  try {
    const query = `*[_type == "post" && slug.current == $slug][0] {
            _id, title, slug, excerpt, publishedAt,
            mainImage { asset { _ref } },
            categories[]->{ title },
            author->{ name, image { asset { _ref } } },
            body
        }`;
    const post = await sanityFetch(query, { slug });
    if (!post) {
      heroEl.innerHTML = `<div style="padding:6rem 5%;text-align:center;color:var(--text-muted)">Article not found.</div>`;
      return;
    }

    const imgRef = post.mainImage?.asset?._ref;
    renderArticleHero(heroEl, {
      title: post.title,
      category: post.categories?.[0]?.title || "Article",
      publishedAt: post.publishedAt,
      author: post.author?.name || "GreenTec Team",
      readTime: estimateReadTime(post.body),
      mainImage: imgRef ? sanityImgUrl(imgRef, 1600) : null,
    });

    renderArticleBody(bodyEl, portableTextToHtml(post.body || []));

    if (sideEl) {
      const relQuery = `*[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0..2] {
                title, slug, mainImage { asset { _ref } }
            }`;
      const related = await sanityFetch(relQuery, { slug });
      renderArticleSidebar(sideEl, related, true);
    }
  } catch (err) {
    console.warn("Article load error:", err);
    heroEl.innerHTML = `<div style="padding:6rem 5%;text-align:center;color:var(--text-muted)">
            Could not load article. Please try again later.
        </div>`;
  }
}

function renderArticleHero(
  el,
  { title, category, publishedAt, author, readTime, mainImage },
) {
  el.innerHTML = `
        <div class="article-hero-bg" style="${mainImage ? `background-image:url('${mainImage}')` : "background: linear-gradient(135deg, var(--green-mid), var(--green-dark))"}"></div>
        <div class="article-hero-overlay"></div>
        <div class="article-hero-content">
            <div class="article-breadcrumb">
                <a href="index.html">Home</a>
                <i class="fa-solid fa-chevron-right"></i>
                <a href="articles.html">Articles</a>
                <i class="fa-solid fa-chevron-right"></i>
                <span>${category}</span>
            </div>
            <span class="article-category-tag">${category}</span>
            <h1 class="article-hero-title">${title}</h1>
            <div class="article-meta-row">
                <span class="article-meta-item">
                    <i class="fa-solid fa-user"></i> ${author}
                </span>
                <span class="article-meta-item">
                    <i class="fa-solid fa-calendar"></i> ${typeof publishedAt === "string" && publishedAt.includes("-") ? formatDate(publishedAt) : publishedAt}
                </span>
                <span class="article-meta-item">
                    <i class="fa-solid fa-clock"></i> ${readTime}
                </span>
            </div>
        </div>
    `;
}

function renderArticleBody(el, htmlContent) {
  el.innerHTML = `<div class="article-content">${htmlContent}</div>`;
}

function renderArticleSidebar(el, relatedPosts, useSanityImg = false) {
  const relHtml = (relatedPosts || [])
    .map((p) => {
      const imgRef = p.mainImage?.asset?._ref;
      const imgUrl = imgRef && useSanityImg ? sanityImgUrl(imgRef, 120) : null;
      const slug = p.slug?.current || p.slug || p.id;
      return `
            <a href="article.html?slug=${slug}${useSanityImg ? "" : "&demo=true"}" class="related-article-item">
                ${
                  imgUrl
                    ? `<img class="related-article-thumb" src="${imgUrl}" alt="${p.title}" loading="lazy">`
                    : `<div class="related-article-thumb-placeholder"><i class="fa-solid fa-solar-panel"></i></div>`
                }
                <span class="related-article-title">${p.title}</span>
            </a>
        `;
    })
    .join("");

  el.innerHTML = `
        <div class="sidebar-card">
            <h4>Related Articles</h4>
            ${relHtml || '<p style="font-size:0.85rem;color:var(--text-muted)">No related articles yet.</p>'}
        </div>
        <div class="sidebar-cta-card">
            <h4>Ready to Go Solar?</h4>
            <p>Get a free energy assessment from our certified engineers.</p>
            <a href="index.html#contact" class="btn-gold" style="width:100%;text-align:center;display:block;">Get a Quote</a>
        </div>
    `;
}

/**
 * Convert Sanity Portable Text blocks to basic HTML.
 * For full fidelity use @portabletext/to-html via CDN.
 */
function portableTextToHtml(blocks) {
  return blocks
    .map((block) => {
      if (block._type === "image") {
        const ref = block.asset?._ref;
        return ref
          ? `<img src="${sanityImgUrl(ref, 900)}" alt="${block.alt || ""}" />`
          : "";
      }
      if (block._type !== "block") return "";

      const text = (block.children || [])
        .map((span) => {
          let t = span.text || "";
          if (span.marks?.includes("strong")) t = `<strong>${t}</strong>`;
          if (span.marks?.includes("em")) t = `<em>${t}</em>`;
          if (span.marks?.includes("code")) t = `<code>${t}</code>`;
          // Link marks
          (block.markDefs || []).forEach((def) => {
            if (span.marks?.includes(def._key) && def._type === "link") {
              t = `<a href="${def.href}" target="_blank" rel="noopener">${t}</a>`;
            }
          });
          return t;
        })
        .join("");

      const style = block.style || "normal";
      if (style === "h2") return `<h2>${text}</h2>`;
      if (style === "h3") return `<h3>${text}</h3>`;
      if (style === "h4") return `<h4>${text}</h4>`;
      if (style === "blockquote")
        return `<blockquote><p>${text}</p></blockquote>`;
      if (block.listItem === "bullet") return `<li>${text}</li>`;
      if (block.listItem === "number") return `<li>${text}</li>`;
      return `<p>${text}</p>`;
    })
    .join("\n");
}

function estimateReadTime(blocks) {
  if (!blocks) return "3 min read";
  const words = blocks.reduce((acc, b) => {
    return (
      acc +
      (b.children || []).reduce(
        (a, s) => a + (s.text || "").split(/\s+/).length,
        0,
      )
    );
  }, 0);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function getDemoArticleBody(post) {
  return `
        <h2>Project Overview</h2>
        <p>${post.excerpt}</p>
        <p>At La Raison GreenTec, every installation begins with a comprehensive energy audit. We measure daily consumption patterns, identify peak load periods, and assess the structural integrity of the installation site. This data-driven approach ensures we right-size every system — nothing more, nothing less than what the client truly needs.</p>

        <h2>The Challenge</h2>
        <p>Nigeria's unreliable grid means that most of our clients are effectively operating off-grid for 8–14 hours per day. A solar system in this context isn't a luxury — it's critical infrastructure. The margin for error is zero.</p>
        <blockquote>
            <p>"We didn't just want solar. We wanted to never think about power again." — Client, Maitama, Abuja</p>
        </blockquote>

        <h2>Our Solution</h2>
        <p>Based on the audit, we designed a hybrid system that combines high-efficiency monocrystalline panels with a LiFePO4 battery bank and a smart hybrid inverter. The system is monitored in real time via our proprietary dashboard, giving both the client and our engineering team instant visibility into performance.</p>

        <h3>Key Components Used</h3>
        <ul>
            <li>6 × 400W monocrystalline solar panels</li>
            <li>10kWh LiFePO4 battery storage (stackable)</li>
            <li>5kVA hybrid MPPT inverter</li>
            <li>Automated transfer switch for seamless grid backup</li>
            <li>Remote monitoring module</li>
        </ul>

        <h2>Results After 30 Days</h2>
        <p>One month after commissioning, the system had generated over 380kWh of clean energy, offsetting approximately 190kg of CO₂ emissions. The client's generator, previously running 10+ hours daily, has been dormant since installation week.</p>
        <p>Monthly savings on diesel and grid bills combined exceed ₦45,000 — putting the system on track to fully pay for itself within 4 years.</p>

        <h2>Ready for a Similar Solution?</h2>
        <p>Whether you're a homeowner, business owner, or facility manager, La Raison GreenTec can design and install a system tailored to your exact needs. <a href="index.html#contact">Contact us today</a> for a free energy assessment and quote.</p>
    `;
}

/* ── Page init ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("blog-grid")) loadHomepageBlog();
  if (document.getElementById("articles-grid")) loadArticlesPage();
  if (document.getElementById("article-hero")) loadSingleArticle();
});
