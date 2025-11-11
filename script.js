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
    // Remove any slides whose images fail to load to avoid empty white frames
    Array.from(track.children).forEach((slide) => {
      const img = slide.querySelector("img");
      if (!img) return;
      if (img.complete && img.naturalWidth === 0) {
        track.removeChild(slide);
      } else {
        img.addEventListener("error", () => {
          if (slide.parentElement) slide.parentElement.removeChild(slide);
        });
      }
    });
    let originalSlides = Array.from(track.children);
    if (originalSlides.length === 0) return;
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    const dotsContainer = carousel.querySelector(".carousel-dots");

    // Build seamless infinite carousel by cloning first/last
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);

    let slides = Array.from(track.children); // includes clones
    let index = 1; // start at first real slide
    let autoplayId = null;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const buildDots = () => {
      originalSlides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goTo(i + 1)); // +1 to account for leading clone
        dotsContainer.appendChild(dot);
      });
    };

    const updateDots = () => {
      const dots = Array.from(dotsContainer.children);
      const logicalIndex =
        (index - 1 + originalSlides.length) % originalSlides.length;
      dots.forEach((d, i) => d.classList.toggle("active", i === logicalIndex));
    };

    const updateAria = () => {
      originalSlides.forEach((slide, i) => {
        slide.setAttribute(
          "aria-label",
          `${i + 1} of ${originalSlides.length}`
        );
      });
    };

    const goTo = (i) => {
      // Clamp to edges (lastClone index = slides.length - 1, firstClone index = 0)
      const maxIndex = slides.length - 1;
      const minIndex = 0;
      index = Math.max(minIndex, Math.min(i, maxIndex));
      track.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const startAutoplay = () => {
      stopAutoplay();
      if (!prefersReducedMotion) {
        autoplayId = setInterval(next, 4000);
      }
    };
    const stopAutoplay = () => {
      if (autoplayId) clearInterval(autoplayId);
    };

    // Seamless wrap using transition end
    track.addEventListener("transitionend", () => {
      slides = Array.from(track.children);
      const lastIndex = slides.length - 1;
      // If we land on a clone or beyond bounds, snap without animation
      if (index >= lastIndex || slides[index] === firstClone) {
        track.style.transition = "none";
        index = 1; // snap to first real
        track.style.transform = `translateX(-${index * 100}%)`;
        void track.offsetWidth; // reflow
        updateDots();
      } else if (index <= 0 || slides[index] === lastClone) {
        track.style.transition = "none";
        index = slides.length - 2; // snap to last real
        track.style.transform = `translateX(-${index * 100}%)`;
        void track.offsetWidth;
        updateDots();
      }
    });

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
    track.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX),
      { passive: true }
    );
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

    // Pause autoplay when carousel is not visible
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      },
      { threshold: 0.1 }
    );
    visibilityObserver.observe(carousel);

    // Keyboard navigation
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        startAutoplay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        startAutoplay();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(slides.length - 2);
      }
    });

    // Init
    buildDots();
    updateAria();
    // position to first real slide
    track.style.transition = "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    requestAnimationFrame(() => {
      track.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
    });
    updateDots();
    startAutoplay();
  }
});
document.getElementById("currentYear").innerHTML = new Date().getFullYear();
