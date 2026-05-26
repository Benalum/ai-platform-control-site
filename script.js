const cards = document.querySelectorAll(".tool-card, .example-card, .step");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

cards.forEach(card => observer.observe(card));
