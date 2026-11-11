const MIN_TEMPERATURE = 70;
const MAX_TEMPERATURE = 500;
const READY_TOLERANCE = 2;

let state = "Idle";
let temperature = MIN_TEMPERATURE;
let target = null;
let readyBeepSent = false;
let heaterOn = false;

const stateText = document.querySelector("#state");
const targetText = document.querySelector("#target-display");
const temperatureText = document.querySelector("#temperature");
const heaterText = document.querySelector("#heater");
const beepText = document.querySelector("#beep-status");
const fill = document.querySelector("#temperature-fill");
const marker = document.querySelector("#temperature-marker");
const log = document.querySelector("#activity-log");
const targetInput = document.querySelector("#target-input");

function addLog(message) {
  const item = document.createElement("li");
  item.textContent = message;
  log.prepend(item);

  while (log.children.length > 8) {
    log.lastElementChild.remove();
  }
}

function clampTemperature(value) {
  return Math.min(
    MAX_TEMPERATURE,
    Math.max(MIN_TEMPERATURE, value)
  );
}

function playBeep() {
  // The visual ready message still works if browser audio is unavailable.
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();

    oscillator.frequency.value = 880;
    volume.gain.value = 0.12;
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.18);
    oscillator.onended = () => audio.close();
  } catch (error) {
    // Audio is optional; the state and on-screen beep status are authoritative.
  }
}

function arriveAtTarget() {
  state = "Maintain";
  heaterOn = false;

  if (!readyBeepSent) {
    readyBeepSent = true;
    beepText.textContent = "Sounded";
    addLog(`Target reached at ${Math.round(temperature)}°. Ready beep.`);
    playBeep();
  }
}

function setTarget(newTarget) {
  target = newTarget;
  readyBeepSent = false;
  beepText.textContent = "Not sounded";

  if (temperature < target - READY_TOLERANCE) {
    state = "Warming";
    heaterOn = true;
    addLog(`Target set to ${target}°. Warming.`);
  } else if (temperature > target + READY_TOLERANCE) {
    state = "Cooling";
    heaterOn = false;
    addLog(`Target set to ${target}°. Cooling toward target.`);
  } else {
    arriveAtTarget();
    addLog(`Target set to ${target}°. Already within range.`);
  }

  render();
}

function tick() {
  if (state === "Warming") {
    heaterOn = true;
    temperature = clampTemperature(temperature + 10);

    if (temperature >= target - READY_TOLERANCE) {
      temperature = Math.min(temperature, target);
      arriveAtTarget();
    }
  } else if (state === "Cooling") {
    heaterOn = false;
    temperature = clampTemperature(temperature - 2);

    if (
      target !== null &&
      temperature <= target + READY_TOLERANCE
    ) {
      temperature = Math.max(temperature, target);
      arriveAtTarget();
    } else if (
      target === null &&
      temperature <= MIN_TEMPERATURE
    ) {
      state = "Idle";
      addLog("Oven cooled to room temperature. Idle.");
    }
  } else if (state === "Maintain") {
    // The thermostat only switches the heater when temperature leaves its band.
    if (temperature < target - READY_TOLERANCE) {
      heaterOn = true;
      temperature = clampTemperature(temperature + 2);
    } else if (temperature > target + READY_TOLERANCE) {
      heaterOn = false;
      temperature = clampTemperature(temperature - 2);
    } else {
      heaterOn = false;
    }
  }

  render();
}

function render() {
  stateText.textContent = state;
  targetText.textContent = target === null ? "None" : `${target}°`;
  temperatureText.textContent = Math.round(temperature);
  heaterText.textContent = heaterOn ? "ON" : "OFF";

  const percent =
    ((temperature - MIN_TEMPERATURE) /
      (MAX_TEMPERATURE - MIN_TEMPERATURE)) *
    100;

  fill.style.width = `${percent}%`;
  marker.style.left = `calc(${percent}% - 2px)`;
}

document.querySelector("#target-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const newTarget = Number(targetInput.value);
  const targetIsInRange =
    Number.isFinite(newTarget) &&
    newTarget >= MIN_TEMPERATURE &&
    newTarget <= MAX_TEMPERATURE;

  if (targetIsInRange) {
    setTarget(newTarget);
  }
});

document.querySelector("#cancel-button").addEventListener("click", () => {
  if (target === null && state === "Idle") return;

  target = null;
  readyBeepSent = false;
  beepText.textContent = "Not sounded";
  heaterOn = false;

  if (temperature > MIN_TEMPERATURE) {
    state = "Cooling";
    addLog("Target canceled. Cooling to room temperature.");
  } else {
    state = "Idle";
    addLog("Target canceled. Idle at room temperature.");
  }

  render();
});

render();
window.setInterval(tick, 1000);
