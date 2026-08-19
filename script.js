const STORAGE_KEY = "nofap_start_time";

// Recupera ou define o início
function getStartTime() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return new Date(saved);
  } else {
    const now = new Date();
    localStorage.setItem(STORAGE_KEY, now.toISOString());
    return now;
  }
}

let startTime = getStartTime();

// Atualiza a cada segundo
setInterval(updateTimer, 1000);

function updateTimer() {
  const now = new Date();
  const diffMs = now - startTime;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Função para formatar com dois dígitos
  const pad = (num) => String(num).padStart(2, "0");

  // Exibe tempo (dias, horas, minutos e segundos)
  document.getElementById("timer").textContent =
    `${pad(diffDays)} dias, ${pad(diffHours % 24)} horas, ${pad(diffMinutes % 60)} minutos, ${pad(diffSeconds % 60)} segundos`;

  // Barras de progresso com percentual (uma casa decimal)
  const dayProgress = Math.min((diffMinutes / 1440) * 100, 100);
  const weekProgress = Math.min((diffDays / 7) * 100, 100);
  const monthProgress = Math.min((diffDays / 30) * 100, 100);

  const dayBar = document.getElementById("dayBar");
  const weekBar = document.getElementById("weekBar");
  const monthBar = document.getElementById("monthBar");

  dayBar.style.width = dayProgress + "%";
  weekBar.style.width = weekProgress + "%";
  monthBar.style.width = monthProgress + "%";

  dayBar.textContent = dayProgress.toFixed(1) + "%";
  weekBar.textContent = weekProgress.toFixed(1) + "%";
  monthBar.textContent = monthProgress.toFixed(1) + "%";
}

// Botão de reset
document.getElementById("resetBtn").addEventListener("click", () => {
  const now = new Date();
  startTime = now;
  localStorage.setItem(STORAGE_KEY, now.toISOString());
  updateTimer();
});
