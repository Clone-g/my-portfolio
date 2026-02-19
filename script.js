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

// ============================
// FX Engine (rain/snow/leaves/sun/mist)
// ============================

let fxStop = null;

function startFX(type) {
  // stop previous
  if (typeof fxStop === "function") fxStop();

  const canvas = document.getElementById("weatherFX");
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // Particle setup
  const particles = [];
  const count = type === "rain" ? 200 : type === "snow" ? 140 : type === "leaves" ? 70 : type === "mist" ? 90 : 60;

  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(type, W(), H()));
  }

  let rafId = null;
  function tick() {
    ctx.clearRect(0, 0, W(), H());
    for (const p of particles) {
      updateParticle(p, type, W(), H());
      drawParticle(ctx, p, type);
    }
    rafId = requestAnimationFrame(tick);
  }
  tick();

  fxStop = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, W(), H());
  };

  console.log("Weather FX:", type);
}

function makeParticle(type, w, h) {
  const base = { x: Math.random() * w, y: Math.random() * h };

  if (type === "rain") {
    return { ...base, vx: -1 - Math.random() * 1.5, vy: 10 + Math.random() * 10, len: 10 + Math.random() * 15 };
  }
  if (type === "snow") {
    return { ...base, vx: -0.5 + Math.random(), vy: 0.8 + Math.random() * 2, r: 1 + Math.random() * 3 };
  }
  if (type === "leaves") {
    return { ...base, vx: -1 + Math.random() * 2, vy: 1 + Math.random() * 2, r: 3 + Math.random() * 6, a: Math.random() * Math.PI * 2, va: -0.05 + Math.random() * 0.1 };
  }
  if (type === "mist") {
    return { ...base, vx: 0.2 + Math.random() * 0.6, vy: -0.1 + Math.random() * 0.2, r: 30 + Math.random() * 90, alpha: 0.03 + Math.random() * 0.06 };
  }
  // sun (sparkle/dust)
  return { ...base, vx: -0.2 + Math.random() * 0.4, vy: -0.2 + Math.random() * 0.4, r: 0.8 + Math.random() * 1.6, alpha: 0.12 + Math.random() * 0.18 };
}

function updateParticle(p, type, w, h) {
  p.x += p.vx;
  p.y += p.vy;

  if (type === "leaves") {
    p.a += p.va;
    p.x += Math.sin(p.a) * 0.6;
  }

  // wrap around edges
  if (p.y > h + 50) { p.y = -50; p.x = Math.random() * w; }
  if (p.y < -120)   { p.y = h + 120; p.x = Math.random() * w; }
  if (p.x < -120)   { p.x = w + 120; p.y = Math.random() * h; }
  if (p.x > w + 120){ p.x = -120; p.y = Math.random() * h; }
}

function drawParticle(ctx, p, type) {
  if (type === "rain") {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.vx * 0.7, p.y + p.len);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
    return;
  }

  if (type === "snow") {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
    return;
  }

  if (type === "leaves") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)"; // subtle leaves overlay
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === "mist") {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // sun sparkle
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
  ctx.fill();
}
