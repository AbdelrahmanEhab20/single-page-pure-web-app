document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");

  // Toggle the 'active' class on the nav links when the button is clicked
  toggleButton.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Simple IntersectionObserver to reveal elements on scroll
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealElements.forEach((el) => observer.observe(el));

  // Simple carousel
  const carousel = document.querySelector(".carousel");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    const dotsContainer = carousel.querySelector(".carousel-dots");

    let index = 0;
    let autoplayId = null;

    const buildDots = () => {
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    };

    const updateDots = () => {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const startAutoplay = () => {
      stopAutoplay();
      autoplayId = setInterval(next, 4000);
    };
    const stopAutoplay = () => {
      if (autoplayId) clearInterval(autoplayId);
    };

    prevBtn.addEventListener("click", () => {
      prev();
      startAutoplay();
    });
    nextBtn.addEventListener("click", () => {
      next();
      startAutoplay();
    });

    // Pause on hover
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);

    // Swipe (basic)
    let startX = null;
    track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    track.addEventListener(
      "touchend",
      (e) => {
        if (startX === null) return;
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        startX = null;
      },
      { passive: true }
    );

    // Init
    buildDots();
    goTo(0);
    startAutoplay();
  }
});
document.getElementById("currentYear").innerHTML = new Date().getFullYear();
