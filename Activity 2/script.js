let isMorning = false;
let roundIsOpen = false;
let score = 0;

const timeMessage = document.querySelector("#time-message");
const feedback = document.querySelector("#feedback");
const scoreDisplay = document.querySelector("#score");
const sunscreenButton = document.querySelector("#sunscreen-button");
const sleepMaskButton = document.querySelector("#sleep-mask-button");

document.querySelector("#check-button").addEventListener("click", function () {
  // Randomly choose morning or night for this round.
  isMorning = Math.random() < 0.5;
  roundIsOpen = true;
  feedback.textContent = "";

  if (isMorning) {
    document.body.classList.remove("night");
    timeMessage.textContent = "It is morning. What will you apply?";
  } else {
    document.body.classList.add("night");
    timeMessage.textContent = "It is night. What will you apply?";
  }

  sunscreenButton.disabled = false;
  sleepMaskButton.disabled = false;
});

function chooseAction(actionIsForMorning) {
  if (!roundIsOpen) return;

  if (isMorning === actionIsForMorning) {
    score += 1;
    scoreDisplay.textContent = score;
    feedback.textContent = "Correct! You earned a point. Click 'check the time' to play again.";
  } else {
    feedback.textContent = "Not quite. Check the time and try again next round.";
  }

  // Only one answer can count in each round.
  roundIsOpen = false;
  sunscreenButton.disabled = true;
  sleepMaskButton.disabled = true;
}

sunscreenButton.addEventListener("click", function () {
  chooseAction(true);
});

sleepMaskButton.addEventListener("click", function () {
  chooseAction(false);
});

document.querySelector("#reset-button").addEventListener("click", function () {
  score = 0;
  scoreDisplay.textContent = score;
  feedback.textContent = "Score reset.";
});
