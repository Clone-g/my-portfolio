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

const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_KEY";

// --- helpers ---
const show = (id, on) => {
  const el = document.getElementById(id);
  if (el) el.style.display = on ? "block" : "none";
};

const setSummerGlow = (on) => {
  document.body.classList.toggle("summer-glow", on);
};

// --- minimal rain effect ---
function startRain() {
  const c = document.getElementById("rainCanvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  show("rainCanvas", true);
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize(); addEventListener("resize", resize);

  const drops = Array.from({ length: 180 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    l: 10 + Math.random() * 18,
    s: 6 + Math.random() * 10
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(180, 220, 255, 0.35)";
    ctx.beginPath();
    for (const d of drops) {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.l);
      d.y += d.s;
      if (d.y > c.height) { d.y = -20; d.x = Math.random() * c.width; }
    }
    ctx.stroke();
    raf = requestAnimationFrame(draw);
  };
  draw();

  return () => { cancelAnimationFrame(raf); show("rainCanvas", false); };
}

// --- minimal snow effect ---
function startSnow() {
  const c = document.getElementById("snowCanvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  show("snowCanvas", true);
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize(); addEventListener("resize", resize);

  const flakes = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: 1 + Math.random() * 2.5,
    s: 0.6 + Math.random() * 1.6,
    w: Math.random() * 1.2
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (const f of flakes) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.s;
      f.x += Math.sin(f.y / 40) * f.w;
      if (f.y > c.height) { f.y = -10; f.x = Math.random() * c.width; }
    }
    raf = requestAnimationFrame(draw);
  };
  draw();

  return () => { cancelAnimationFrame(raf); show("snowCanvas", false); };
}

let stopRain = null;
let stopSnow = null;

// --- decide which effect based on OpenWeather code + temperature ---
function applyWeatherEffects({ conditionId, tempC }) {
  // stop any previous effects
  if (stopRain) { stopRain(); stopRain = null; }
  if (stopSnow) { stopSnow(); stopSnow = null; }
  setSummerGlow(false);

  // OpenWeather condition groups:
  // 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow, 800 clear, 80x clouds :contentReference[oaicite:1]{index=1}
  const group = Math.floor(conditionId / 100);

  if (group === 2 || group === 3 || group === 5) stopRain = startRain();
  else if (group === 6) stopSnow = startSnow();
  else if (tempC >= 28) setSummerGlow(true); // “summer vibe” when hot
}

// --- fetch current weather by coords ---
async function fetchWeatherByCoords(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    conditionId: data.weather?.[0]?.id ?? 800,
    tempC: data.main?.temp ?? 25
  };
}

// --- main entry: geolocation -> weather -> effect ---
async function initGeoWeatherEffects() {
  // GitHub Pages is HTTPS, so geolocation can work. User must allow permission.
  if (!("geolocation" in navigator)) return fallbackSeasonal();

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      const w = await fetchWeatherByCoords(latitude, longitude);
      applyWeatherEffects(w);
    } catch (e) {
      console.warn(e);
      fallbackSeasonal();
    }
  }, () => {
    fallbackSeasonal();
  }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 });
}

// --- fallback if location denied: simple seasonal logic (works everywhere) ---
function fallbackSeasonal() {
  const month = new Date().getMonth() + 1;

  // basic northern-hemisphere-ish season fallback:
  // (If you want Thailand-specific seasons, tell me and I’ll adjust.)
  if (month >= 12 || month <= 2) {
    // winter vibe
    stopSnow = startSnow();
  } else if (month >= 6 && month <= 10) {
    // rainy vibe
    stopRain = startRain();
  } else if (month >= 3 && month <= 5) {
    // hot/summer vibe
    setSummerGlow(true);
  }
}

initGeoWeatherEffects();
