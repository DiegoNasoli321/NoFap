const STORAGE_KEY = "nofap_start_time";
const RELAPSE_KEY = "nofap_relapses";
const RELAPSE_DATES_KEY = "nofap_relapse_dates";
const RELAPSE_TEXT_COLOR_KEY = "nofap_relapse_text_color";
const RELAPSE_DAY_COLORS_KEY = "nofap_relapse_day_colors";

function getStartTime() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return new Date(saved);
  const now = new Date();
  localStorage.setItem(STORAGE_KEY, now.toISOString());
  return now;
}

function getRelapses() {
  let saved = localStorage.getItem(RELAPSE_KEY);
  if (saved) return parseInt(saved, 10);
  localStorage.setItem(RELAPSE_KEY, "0");
  return 0;
}

function getRelapseDates() {
  let saved = localStorage.getItem(RELAPSE_DATES_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(RELAPSE_DATES_KEY, JSON.stringify([]));
  return [];
}

function getRelapseDayColors() {
  let saved = localStorage.getItem(RELAPSE_DAY_COLORS_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(RELAPSE_DAY_COLORS_KEY, JSON.stringify({}));
  return {};
}

let startTime = getStartTime();
let relapses = getRelapses();
let relapseDates = getRelapseDates();
let relapseDayColors = getRelapseDayColors();

const SECONDS_IN_DAY = 86400;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;

// Atualiza imediatamente ao abrir
updateTimer();
setInterval(updateTimer, 1000);

function updateTimer() {
  const now = new Date();
  const diffSeconds = Math.floor((now - startTime) / 1000);

  const days = Math.floor(diffSeconds / SECONDS_IN_DAY);
  const hours = Math.floor((diffSeconds % SECONDS_IN_DAY) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const secs = diffSeconds % 60;

  const pad = (num) => String(num).padStart(2, "0");

  document.getElementById("timer").textContent =
    `${pad(days)} dias, ${pad(hours)} horas, ${pad(minutes)} minutos, ${pad(secs)} segundos`;

  // Barras
  updateBar("dayBar", ((diffSeconds % SECONDS_IN_DAY) / SECONDS_IN_DAY) * 100);
  updateBar("weekBar", ((diffSeconds % SECONDS_IN_WEEK) / SECONDS_IN_WEEK) * 100);
  updateBar("monthBar", ((diffSeconds % SECONDS_IN_MONTH) / SECONDS_IN_MONTH) * 100);

  // Ciclos completos
  document.getElementById("dayCycles").textContent = Math.floor(diffSeconds / SECONDS_IN_DAY);
  document.getElementById("weekCycles").textContent = Math.floor(diffSeconds / SECONDS_IN_WEEK);
  document.getElementById("monthCycles").textContent = Math.floor(diffSeconds / SECONDS_IN_MONTH);

  // Recaídas
  const relapseEl = document.getElementById("relapses");
  relapseEl.textContent = relapses + " Recaídas";

  // Reaplica cor salva do texto
  const savedColor = localStorage.getItem(RELAPSE_TEXT_COLOR_KEY);
  if (savedColor) relapseEl.style.color = savedColor;
}

function updateBar(elementId, progress) {
  const bar = document.getElementById(elementId);
  bar.style.width = progress + "%";
  bar.textContent = progress.toFixed(1) + "%";
}

function darkenColor(color, amount) {
  let c = color.substring(1);
  let r = parseInt(c.substring(0,2), 16);
  let g = parseInt(c.substring(2,4), 16);
  let b = parseInt(c.substring(4,6), 16);

  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  return "#" + 
    r.toString(16).padStart(2,"0") + 
    g.toString(16).padStart(2,"0") + 
    b.toString(16).padStart(2,"0");
}

// Escurece texto e salva cor
function darkenRelapseText() {
  const el = document.getElementById("relapses");
  const currentColor = window.getComputedStyle(el).color;
  const rgb = currentColor.match(/\d+/g).map(Number);
  let hex = "#" + rgb.map(x => x.toString(16).padStart(2,"0")).join("");
  const newColor = darkenColor(hex, 35);
  el.style.color = newColor;
  localStorage.setItem(RELAPSE_TEXT_COLOR_KEY, newColor);
}

// Escurece quadradinho e salva cor
function darkenCalendarDay(dayDiv, id) {
  const currentColor = window.getComputedStyle(dayDiv).backgroundColor;
  const rgb = currentColor.match(/\d+/g).map(Number);
  let hex = "#" + rgb.map(x => x.toString(16).padStart(2,"0")).join("");
  const newColor = darkenColor(hex, 80);
  dayDiv.style.backgroundColor = newColor;
  relapseDayColors[id] = newColor;
  localStorage.setItem(RELAPSE_DAY_COLORS_KEY, JSON.stringify(relapseDayColors));
}

// Calendário
function generateCalendar(year) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  for (let m = 0; m < 12; m++) {
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");

    const title = document.createElement("h3");
    title.textContent = months[m];
    monthDiv.appendChild(title);

    const daysDiv = document.createElement("div");
    daysDiv.classList.add("days");

    const daysInMonth = new Date(year, m+1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day");
      dayDiv.textContent = d;
      dayDiv.id = `day-${year}-${m+1}-${d}`;
      daysDiv.appendChild(dayDiv);
    }

    monthDiv.appendChild(daysDiv);
    calendar.appendChild(monthDiv);
  }

  // Reaplica marcações salvas
  relapseDates.forEach(dateStr => {
    const dayDiv = document.getElementById(dateStr);
    if (dayDiv) {
      dayDiv.classList.add("marked");
      if (relapseDayColors[dateStr]) {
        dayDiv.style.backgroundColor = relapseDayColors[dateStr];
      }
    }
  });
}

generateCalendar(new Date().getFullYear());

// Marca recaída
function markRelapse() {
  const now = new Date();
  const id = `day-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  const dayDiv = document.getElementById(id);
  if (dayDiv) {
    dayDiv.classList.add("marked");
    darkenCalendarDay(dayDiv, id);
  }
  relapseDates.push(id);
  localStorage.setItem(RELAPSE_DATES_KEY, JSON.stringify(relapseDates));
}

// Limpa marcações e reseta cor
function clearCalendarMarks() {
  const markedDays = document.querySelectorAll(".day.marked");
  markedDays.forEach(day => {
    day.classList.remove("marked");
    day.style.backgroundColor = "#334155"; // volta para cor original do CSS
  });

  relapseDates = [];
  relapseDayColors = {};
  localStorage.setItem(RELAPSE_DATES_KEY, JSON.stringify([]));
  localStorage.setItem(RELAPSE_DAY_COLORS_KEY, JSON.stringify({}));

  // Resetar cor do texto
  const relapseEl = document.getElementById("relapses");
  relapseEl.style.color = "#f87171"; // cor inicial
  localStorage.setItem(RELAPSE_TEXT_COLOR_KEY, "#f87171");
}

// Botão de recaída
document.getElementById("resetBtn").addEventListener("click", () => {
  const now = new Date();
  startTime = now;
  localStorage.setItem(STORAGE_KEY, now.toISOString());

  relapses++;
  localStorage.setItem(RELAPSE_KEY, relapses.toString());

  markRelapse();
  updateTimer();
  darkenRelapseText();
});

// Botão de zerar recaídas
document.getElementById("clearRelapsesBtn").addEventListener("click", () => {
  relapses = 0;
  localStorage.setItem(RELAPSE_KEY, "0");

  clearCalendarMarks();
  updateTimer();
});
