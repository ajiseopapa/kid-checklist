"use client";

import confetti from "canvas-confetti";

export function fireConfetti() {
  const colors = ["#FFB996", "#A8E6CE", "#C9B8FF", "#FFD93D", "#FFAAC9", "#9ED8FF"];
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors,
    scalar: 1.1,
    ticks: 220,
  });
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      startVelocity: 25,
      origin: { y: 0.5 },
      colors,
      scalar: 0.9,
      ticks: 200,
    });
  }, 180);
}

export function fireBigConfetti() {
  const colors = ["#FFB996", "#A8E6CE", "#C9B8FF", "#FFD93D", "#FFAAC9", "#9ED8FF"];
  const end = Date.now() + 1200;
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
