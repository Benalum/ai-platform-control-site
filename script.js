const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const cards = document.querySelectorAll(".feature-card, .service-list article, .pricing-card, .timeline article");

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

cards.forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(14px)";
  card.style.transition = "opacity 450ms ease, transform 450ms ease";
  observer.observe(card);
});

document.addEventListener("animationstart", (event) => {
  if (event.animationName === "none") return;
});

const style = document.createElement("style");
style.textContent = `
  .is-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);
