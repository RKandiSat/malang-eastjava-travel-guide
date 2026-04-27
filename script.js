// ── CLOCK ────────────────────────────────────────
function updateClock() {
  var now = new Date();
  var opts = { timeZone: 'Asia/Jakarta', hour12: false };
  var t = now.toLocaleTimeString('en-GB', { ...opts, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  var d = now.toLocaleDateString('en-GB', { ...opts, weekday:'long', day:'numeric', month:'long', year:'numeric' });
  document.getElementById('clock').textContent = t + ' WIB';
  document.getElementById('clock-date').textContent = d;
}
setInterval(updateClock, 1000);
updateClock();

// ── SECTION TOGGLE ────────────────────────────────
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  var el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
  if (btn) btn.classList.add('active');
}

// ── CHECKLIST ─────────────────────────────────────
function toggleCheck(li, event) {
  var cb = li.querySelector('input');
  if (event.target !== cb) cb.checked = !cb.checked;
  li.classList.toggle('checked', cb.checked);
}

// ── SCROLL TOP ────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').style.display = window.scrollY > 400 ? 'flex' : 'none';
});
function scrollToTop() { window.scrollTo({ top:0, behavior:'smooth' }); }

// ── LIVE WEATHER (Open-Meteo — FREE, no key needed) ──
async function loadWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-7.9797&longitude=112.6304&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability&timezone=Asia%2FJakarta';
    const r = await fetch(url);
    const d = await r.json();
    const c = d.current;
    const code = c.weather_code;
    const icon = weatherIcon(code);
    const desc = weatherDesc(code);
    const temp = Math.round(c.temperature_2m);
    const feels = Math.round(c.apparent_temperature);
    const hum = c.relative_humidity_2m;
    const wind = Math.round(c.wind_speed_10m);
    const rain = c.precipitation_probability;

    // Strip
    document.getElementById('weatherStrip').innerHTML = `
      <div class="witem">${icon} <span class="wtemp">${temp}°C</span> <span class="wlabel">${desc}</span></div>
      <div class="witem">💧 <span class="wlabel">Humidity: ${hum}%</span></div>
      <div class="witem">💨 <span class="wlabel">Wind: ${wind} km/h</span></div>
      <div class="witem">🌧️ <span class="wlabel">Rain: ${rain}%</span></div>
      <div class="witem" style="font-size:0.75rem; opacity:0.7;">📍 Malang, WIB · Live</div>
    `;

    // Section
    document.getElementById('wh-temp').textContent = temp + '°C';
    document.getElementById('wh-desc').textContent = desc;
    document.getElementById('wh-feels').textContent = 'Feels like ' + feels + '°C';
    document.getElementById('wh-humidity').textContent = '💧 Humidity ' + hum + '%';
    document.getElementById('wh-wind').textContent = '💨 Wind ' + wind + ' km/h';
    document.getElementById('wh-rain').textContent = '🌧️ Rain ' + rain + '%';
    document.querySelector('#weatherHero .wh-icon').textContent = icon;
  } catch(e) {
    document.getElementById('weatherStrip').innerHTML = '<span style="opacity:0.7;">⚠️ Weather data unavailable — check connection</span>';
  }
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}
function weatherDesc(code) {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Light Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Variable';
}

// ── LIVE CURRENCY (Open Exchange Rates — free tier) ──
var ratesCache = null;
async function loadRates() {
  try {
    // Using open.er-api.com — completely free, no key needed
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const d = await r.json();
   
    ratesCache = {};

    // USD to IDR
    const usdToIdr = d.rates['IDR'];

    for (const [currency, rate] of Object.entries(d.rates)) {
     if (currency === 'IDR') continue;

     // Convert: currency to IDR
       ratesCache[currency] = usdToIdr / rate;
    }

    // Add IDR itself
    ratesCache['IDR'] = 1;

    // Ticker
    const tickers = ['USD','EUR','GBP','SGD','AUD','MYR','NOK','JPY','KRW'];
    const flags = {USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',SGD:'🇸🇬',AUD:'🇦🇺',MYR:'🇲🇾',NOK:'🇳🇴',JPY:'🇯🇵',KRW:'🇰🇷'};
    let tickerHTML = '<span class="tick-label">💱 LIVE IDR RATES:</span>';
    tickers.forEach(c => {
      if (ratesCache[c]) {
        const val = ratesCache[c] >= 1000 
          ? 'Rp' + Math.round(ratesCache[c]).toLocaleString() 
          : 'Rp' + ratesCache[c].toFixed(1);
        tickerHTML += `<span>${flags[c]} <strong>1 ${c}</strong> = ${val}</span>`;
      }
    });
    document.getElementById('currencyTicker').innerHTML = tickerHTML;
  } catch(e) {
    document.getElementById('currencyTicker').innerHTML = '<span style="opacity:0.6;">💱 Exchange rates temporarily unavailable</span>';
  }
}

function convertCurrency() {
  if (!ratesCache) { alert('Exchange rates loading, please wait a moment…'); return; }
  const amount = parseFloat(document.getElementById('convAmount').value) || 0;
  const from = document.getElementById('convFrom').value;
  const rate = ratesCache[from];
  if (!rate) return;
  const idr = amount * rate;
  document.getElementById('convResult').innerHTML = `
    ${amount.toLocaleString()} ${from} = <strong>Rp ${Math.round(idr).toLocaleString()}</strong>
    <small>Rate: 1 ${from} = Rp ${Math.round(rate).toLocaleString()} · Live via open.er-api.com</small>
  `;
}

function convertFromIDR() {
  if (!ratesCache) { alert('Exchange rates loading, please wait a moment…'); return; }
  const idr = parseFloat(document.getElementById('convIDR').value) || 0;
  const to = document.getElementById('convTo').value;
  const rate = ratesCache[to];
  if (!rate) return;
  const result = idr / rate;
  const decimals = result < 100 ? 2 : 0;
  document.getElementById('convResultIDR').innerHTML = `
    Rp ${idr.toLocaleString()} = <strong>${result.toFixed(decimals)} ${to}</strong>
    <small>Rate: 1 ${to} = Rp ${Math.round(rate).toLocaleString()} · Live via open.er-api.com</small>
  `;
}

// ── PAID LISTING FORM ─────────────────────────────
function selectTier(card, tier) {
  document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('selectedTier').value = tier;
}

function submitListing() {
  const name = document.getElementById('bizName').value.trim();
  const contact = document.getElementById('bizContact').value.trim();
  if (!name || !contact) { alert('Please fill in Business Name and WhatsApp Number at minimum.'); return; }
  const tier = document.getElementById('selectedTier').value;
  const type = document.getElementById('bizType').value;
  const email = document.getElementById('bizEmail').value;
  const address = document.getElementById('bizAddress').value;
  const desc = document.getElementById('bizDesc').value;
  const tierLabel = { basic: 'Basic (Rp300K/month)', standard: 'Standard (Rp600K/3months)', premium: 'Premium (Rp1.2M/6months)' }[tier];
  const msg = encodeURIComponent(
    `Hi! I'd like to apply for a Featured Listing on your Malang Travel Guide.\n\n` +
    `📌 Business: ${name}\n` +
    `🏷️ Type: ${type || 'Not specified'}\n` +
    `📦 Package: ${tierLabel}\n` +
    `📞 WhatsApp: ${contact}\n` +
    `📧 Email: ${email || 'Not provided'}\n` +
    `📍 Address: ${address || 'Not provided'}\n` +
    `📝 Description: ${desc || 'Not provided'}`
  );
  document.getElementById('listingSuccess').style.display = 'block';
  setTimeout(() => { window.open(`https://wa.me/6281250900387?text=${msg}`, '_blank'); }, 500);
}

// ── LANGUAGE ──────────────────────────────────────
function setLang(lang, btn) {
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  var t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    var key = el.getAttribute('data-i18n');
    if (t && t[key]) el.innerHTML = t[key];
  });
}

// ── TRANSLATIONS ──────────────────────────────────
const translations = {
  en: {
    'hero-title': 'Welcome to<br><span>Malang</span>',
    'hero-sub': "Your complete guide to East Java's most charming city",
    'nav-prepare':'Before You Go','nav-weather':'Weather','nav-costume':'What to Wear',
    'nav-equipment':'Equipment','nav-destinations':'Destinations','nav-prices':'Prices',
    'nav-map':'Map','nav-accommodation':'Hotels','nav-transport':'Transport',
    'nav-emergency':'Emergency','nav-dodont':"Do's & Don'ts",'nav-market':'Markets'
  },
  id: {
    'hero-title': 'Selamat Datang di<br><span>Malang</span>',
    'hero-sub': 'Panduan lengkap kota terindah di Jawa Timur',
    'nav-prepare':'Persiapan','nav-weather':'Cuaca','nav-costume':'Pakaian',
    'nav-equipment':'Perlengkapan','nav-destinations':'Destinasi','nav-prices':'Harga',
    'nav-map':'Peta','nav-accommodation':'Hotel','nav-transport':'Transportasi',
    'nav-emergency':'Darurat','nav-dodont':'Aturan','nav-market':'Pasar'
  },
  ru: {
    'hero-title': 'Добро пожаловать в<br><span>Маланг</span>',
    'hero-sub': 'Полный путеводитель по жемчужине Восточной Явы',
    'nav-prepare':'Подготовка','nav-weather':'Погода','nav-costume':'Одежда',
    'nav-equipment':'Снаряжение','nav-destinations':'Достопримечательности','nav-prices':'Цены',
    'nav-map':'Карта','nav-accommodation':'Жильё','nav-transport':'Транспорт',
    'nav-emergency':'Экстренные','nav-dodont':'Правила','nav-market':'Рынки'
  },
  ko: {
    'hero-title': '말랑에<br><span>오신걸 환영합니다</span>',
    'hero-sub': '동부 자바의 가장 매력적인 도시 완벽 가이드',
    'nav-prepare':'출발 전','nav-weather':'날씨','nav-costume':'복장',
    'nav-equipment':'준비물','nav-destinations':'관광지','nav-prices':'가격',
    'nav-map':'지도','nav-accommodation':'숙박','nav-transport':'교통',
    'nav-emergency':'긴급','nav-dodont':'주의사항','nav-market':'시장'
  },
  no: {
    'hero-title': 'Velkommen til<br><span>Malang</span>',

    'hero-sub': 'Din komplette guide til Øst-Javas mest sjarmerende by',
    'nav-prepare':'Forberedelse','nav-weather':'Vær','nav-costume':'Antrekk',
    'nav-equipment':'Utstyr','nav-destinations':'Destinasjoner','nav-prices':'Priser',
    'nav-map':'Kart','nav-accommodation':'Overnatting','nav-transport':'Transport',
    'nav-emergency':'Nødhjelp','nav-dodont':'Regler','nav-market':'Markeder'
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  await loadRates();
});

// Auto convert when user types or changes selection
document.getElementById('convAmount')?.addEventListener('input', convertCurrency);
document.getElementById('convFrom')?.addEventListener('change', convertCurrency);

document.getElementById('convIDR')?.addEventListener('input', convertFromIDR);
document.getElementById('convTo')?.addEventListener('change', convertFromIDR);

setInterval(loadRates, 300000);

// ---- INITIALISE ALL ON PAGE LOAD --------------------------------
loadWeather ();
loadRates ();
updateClock ();
setInterval(updateClock, 1000);
setInterval(loadRates, 1800000); // refresh rates every 30 min

// ---- TOUR CATEGORY TOGGLE ------------------------------
function toggleTour(category) {
  const allTours = ['city', 'culinary', 'nature', 'cultural'];
  allTours.forEach(tour => {
    const el = document.getElementById('tour-' + tour);
    if (el) {
      if (tour === category) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
      } else {
        el.style.display = 'none';
      }
    }
  })

  // Smooth sroll to detail
  const target = document.getElementById('tour-' + category);
  if (target && target.style.display === 'block') {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start'});
    }, 100);
  }
}

// --- ROTATING HERO BACKGROUND -------------
const heroImage = [
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1600', // Bromo
  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600', // Colorful village
  'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=1600', // Temple
  'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=1600', // Waterfall
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600', // Beach
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600', // Mountains
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600', // Forest
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', // Scenic
];

let currentHeroImage = 0;
const hero = document.querySelector('.hero');

function rotateHero() {
  if (!hero) return;
  currentHeroImage = (currentHeroImages + 1) % heroImages.length;
  hero.style.transition = 'background-image 1.5s ease-in-out';
  hero.style.backgroundImage = `
    linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
    url('${heroImage[currentHeroImage]}')
    `;
}

// Rotate every 5 seconds
setInterval(rotateHero, 5000);

rotateHero(); // start immediately