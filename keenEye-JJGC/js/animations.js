class Animations {
  static async showConfetti(element) {
    const colors = ["#4ecca3", "#ff6b6b", "#ffd93d", "#6c5ce7"];
    const particles = 50;
    const duration = CONFIG.FEEDBACK_DURATION;

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 1 + 0.5 + "s";
      particle.style.animationDelay = Math.random() * 0.5 + "s";
      element.appendChild(particle);
    }

    await new Promise((resolve) => setTimeout(resolve, duration));
    element.innerHTML = "";
  }

  static async showBomb(element) {
    const bomb = document.createElement("div");
    bomb.className = "bomb-animation";
    element.appendChild(bomb);

    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.FEEDBACK_DURATION)
    );
    element.innerHTML = "";
  }

  static async flipCard(element) {
    element.style.transform = "rotateY(180deg)";
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.CARD_FLIP_DURATION / 2)
    );
    element.style.transform = "rotateY(0)";
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.CARD_FLIP_DURATION / 2)
    );
  }

  static async fadeIn(element) {
    element.style.opacity = "0";
    element.classList.remove("hidden");
    await new Promise((resolve) => setTimeout(resolve, 50));
    element.style.opacity = "1";
  }

  static async fadeOut(element) {
    element.style.opacity = "0";
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.ANIMATION_DURATION)
    );
    element.classList.add("hidden");
  }
}

// Add animation styles to the document
const style = document.createElement("style");
style.textContent = `
    .confetti-particle {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        animation: confetti-fall linear forwards;
    }

    @keyframes confetti-fall {
        0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }

    .bomb-animation {
        position: absolute;
        width: 50px;
        height: 50px;
        background: #ff6b6b;
        border-radius: 50%;
        animation: bomb-explosion 1s ease-out forwards;
    }

    @keyframes bomb-explosion {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(2);
            opacity: 0.5;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
