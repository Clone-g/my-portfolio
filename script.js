const themeToggle = document.getElementById("themeToggle");
const body = document.body;

const savedTheme = localStorage.getItem("preferred-theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

function toggleTheme() {
  const isDark = body.classList.toggle("dark");
  themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("preferred-theme", isDark ? "dark" : "light");
}

themeToggle.addEventListener("click", toggleTheme);

document.getElementById("year").textContent = new Date().getFullYear();

const animatedElements = document.querySelectorAll("[data-animate]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

animatedElements.forEach((el) => observer.observe(el));

const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const navToggle = document.getElementById("nav-toggle");
    if (navToggle && navToggle.checked) {
      navToggle.checked = false;
    }
  });
});
