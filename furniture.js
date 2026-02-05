// Select all elements with reveal classes
const reveals = document.querySelectorAll(
  ".reveal-up, .reveal-left, .reveal-right",
);

// Callback for IntersectionObserver
const revealOnScroll = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("reveal-active");
      observer.unobserve(entry.target); // Stop observing once revealed
    }
  });
};

// Create observer with threshold
const observer = new IntersectionObserver(revealOnScroll, {
  threshold: 0.1, // trigger when 10% visible
});

// Observe each element
reveals.forEach((el, i) => {
  // Optional: add staggered animation delay
  el.style.transitionDelay = `${i * 0.1}s`;
  observer.observe(el);
});
