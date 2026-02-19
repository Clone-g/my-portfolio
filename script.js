const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("nav-toggle");
const navOverlay = document.getElementById("navOverlay");
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

const updateNavState = (isOpen) => {
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }
  body.classList.toggle("nav-open", isOpen);
  if (navOverlay) {
    navOverlay.toggleAttribute("hidden", !isOpen);
  }
};

if (navToggle) {
  updateNavState(navToggle.checked);
  navToggle.addEventListener("change", () => {
    updateNavState(navToggle.checked);
  });
}

const closeNavigation = () => {
  if (!navToggle) return;
  navToggle.checked = false;
  updateNavState(false);
};

if (navOverlay) {
  navOverlay.addEventListener("click", closeNavigation);
}

const desktopBreakpoint = window.matchMedia("(min-width: 961px)");
const handleBreakpointChange = (event) => {
  if (event.matches) {
    closeNavigation();
  }
};

if (desktopBreakpoint.addEventListener) {
  desktopBreakpoint.addEventListener("change", handleBreakpointChange);
} else if (desktopBreakpoint.addListener) {
  desktopBreakpoint.addListener(handleBreakpointChange);
}

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
  link.addEventListener("click", closeNavigation);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle && navToggle.checked) {
    closeNavigation();
  }
});

const form = document.querySelector('.contact-form');
const statusEl = document.getElementById('form-status');

const SERVICE_ID = 'service_3zcq4e8';     // ← replace
const TEMPLATE_ID = 'template_nppvqz5';    // ← replace

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  statusEl.textContent = '';
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Sending…';

  try {
    // Option A: send the whole form
    const result = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);

    // Option B: send explicit params
    // const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    //   name: form.name.value,
    //   email: form.email.value,
    //   message: form.message.value
    // });

    statusEl.style.color = 'green';
    statusEl.textContent = 'Thanks! Your message has been sent.';
    form.reset();
  } catch (err) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Sorry, something went wrong. Please try again.';
    console.error(err);
  } finally {
    btn.disabled = false; btn.textContent = 'Send Message';
  }
});

// =======================================
// Weather FX (Version B: NO API)
// =======================================

function getHemisphereFromLat(lat) {
  return lat >= 0 ? "north" : "south";
}

function pickEffectFromSeason(monthIndex0, hemisphere) {
  // monthIndex0: 0=Jan ... 11=Dec
  // Simple season mapping:
  // North: Winter Dec-Feb, Spring Mar-May, Summer Jun-Aug, Autumn Sep-Nov
  // South: reversed
  const m = monthIndex0;
  const north = hemisphere === "north";

  // Helper: check if in set
  const inMonths = (...arr) => arr.includes(m);

  if (north) {
    if (inMonths(11, 0, 1)) return "snow";   // Dec,Jan,Feb
    if (inMonths(2, 3, 4)) return "rain";    // Mar-Apr-May (spring showers vibe)
    if (inMonths(5, 6, 7)) return "sun";     // Jun-Jul-Aug
    return "leaves";                          // Sep-Oct-Nov
  } else {
    // Southern hemisphere
    if (inMonths(5, 6, 7)) return "snow";    // Jun-Jul-Aug (winter)
    if (inMonths(8, 9, 10)) return "rain";   // Sep-Oct-Nov
    if (inMonths(11, 0, 1)) return "sun";    // Dec-Jan-Feb (summer)
    return "leaves";                          // Mar-Apr-May
  }
}

function initWeatherFX_NoAPI() {
  const month = new Date().getMonth();

  // Default hemisphere if user blocks location:
  let hemisphere = "north";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        hemisphere = getHemisphereFromLat(pos.coords.latitude);
        startFX(pickEffectFromSeason(month, hemisphere));
      },
      () => {
        // no location permission — still works using default hemisphere
        startFX(pickEffectFromSeason(month, hemisphere));
      },
      { timeout: 5000, maximumAge: 60_000 }
    );
  } else {
    startFX(pickEffectFromSeason(month, hemisphere));
  }
}
