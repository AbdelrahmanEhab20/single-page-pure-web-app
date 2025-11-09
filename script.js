document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");

  // Toggle the 'active' class on the nav links when the button is clicked
  toggleButton.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
});
document.getElementById("currentYear").innerHTML = new Date().getFullYear();
