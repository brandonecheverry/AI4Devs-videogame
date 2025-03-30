class Game {
  constructor() {
    this.score = 0;
    this.currentRound = 0;
    this.timer = null;
    this.timeLeft = CONFIG.TIME_LIMIT;
    this.isPlaying = false;
    this.images = [];

    // DOM elements
    this.startScreen = document.getElementById("start-screen");
    this.gameScreen = document.getElementById("game-screen");
    this.gameOverScreen = document.getElementById("game-over-screen");
    this.mainImage = document.getElementById("main-image");
    this.options = document.querySelectorAll(".option");
    this.timerElement = document.getElementById("timer");
    this.scoreElement = document.getElementById("score");
    this.finalScoreElement = document.getElementById("final-score");

    // Bind event listeners
    this.startButton = document.getElementById("start-button");
    this.restartButton = document.getElementById("restart-button");
    this.startButton.addEventListener("click", () => this.startGame());
    this.restartButton.addEventListener("click", () => this.startGame());

    // Bind option click handlers
    this.options.forEach((option) => {
      option.addEventListener("click", (e) => this.handleOptionClick(e));
    });
  }

  async startGame() {
    this.score = 0;
    this.currentRound = 0;
    this.updateScore();
    await this.showScreen(this.startScreen);
    await Animations.fadeOut(this.startScreen);
    await Animations.fadeIn(this.gameScreen);
    await this.startRound();
  }

  async startRound() {
    if (this.currentRound >= CONFIG.ROUNDS) {
      await this.endGame();
      return;
    }

    this.isPlaying = true;
    this.timeLeft = CONFIG.TIME_LIMIT;
    this.updateTimer();
    this.startTimer();

    // Reset all options before loading new images
    this.options.forEach((option) => {
      const img = option.querySelector("img");
      if (img) {
        img.style.display = "block"; // Make sure image is visible
        img.src = ""; // Clear the source
        option.classList.remove("selected", "correct", "incorrect");
        option.style.pointerEvents = "auto";
      }
    });

    // Load and display images for the current round
    const roundImages = CONFIG.IMAGE_ROUNDS[this.currentRound];
    await this.loadImages(roundImages);
    await this.displayImages(roundImages);
  }

  async loadImages(roundImages) {
    // Use local image paths and track the correct image
    this.images = roundImages.variations.map((path) => ({
      url: path,
      isCorrect: path === roundImages.main,
    }));
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async displayImages(roundImages) {
    // Create a copy of the images array and shuffle it
    const shuffledImages = [...this.images];
    this.shuffleArray(shuffledImages);

    // Display main image using the main image path for this round
    this.mainImage.src = roundImages.main;

    // Display options
    this.options.forEach((option, index) => {
      const img = option.querySelector("img");
      if (img) {
        img.style.display = "block"; // Ensure image is visible
        img.src = shuffledImages[index].url;
        option.dataset.isCorrect = shuffledImages[index].isCorrect;
        option.classList.remove("selected", "correct", "incorrect");
        option.style.pointerEvents = "auto";
      }
    });

    // Wait for all images to load
    const loadPromises = [
      new Promise((resolve) => {
        if (this.mainImage.complete) resolve();
        else this.mainImage.onload = resolve;
      }),
      ...Array.from(this.options).map(
        (option) =>
          new Promise((resolve) => {
            const img = option.querySelector("img");
            if (img) {
              if (img.complete) resolve();
              else img.onload = resolve;
            } else {
              resolve();
            }
          })
      ),
    ];

    await Promise.all(loadPromises);
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTimer();
      } else {
        this.handleTimeUp();
      }
    }, 1000);
  }

  updateTimer() {
    this.timerElement.textContent = this.timeLeft;
  }

  updateScore() {
    this.scoreElement.textContent = this.score;
  }

  async handleOptionClick(event) {
    if (!this.isPlaying) return;

    const option = event.currentTarget;
    const isCorrect = option.dataset.isCorrect === "true";

    // IMPORTANT: Save the image element info before animation
    let savedImgSrc = "";
    let savedImgAlt = "";
    const imgElement = option.querySelector("img");
    if (imgElement) {
      savedImgSrc = imgElement.src;
      savedImgAlt = imgElement.alt || "Option image";
      console.log("Saved image info:", savedImgSrc);
    }

    // Disable all options
    this.options.forEach((opt) => (opt.style.pointerEvents = "none"));

    // Show feedback
    if (isCorrect) {
      option.classList.add("correct");
      this.score += CONFIG.SCORE_INCREMENT;
      await Animations.showConfetti(option);
    } else {
      option.classList.add("incorrect");
      this.score -= CONFIG.SCORE_DECREMENT;
      await Animations.showBomb(option);
    }

    // IMPORTANT: Restore the image after animation
    // The animation methods in animations.js clear the element's innerHTML
    if (savedImgSrc) {
      console.log("Restoring image after animation");
      const newImg = document.createElement("img");
      newImg.src = savedImgSrc;
      newImg.alt = savedImgAlt;
      newImg.style.display = "block"; // Make sure it's visible
      option.appendChild(newImg);
    }

    this.updateScore();
    this.isPlaying = false;
    clearInterval(this.timer);
    this.timer = null;

    // Wait for feedback animation
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.FEEDBACK_DURATION)
    );

    // Move to next round
    this.currentRound++;
    await this.startRound();
  }

  handleTimeUp() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearInterval(this.timer);
    this.score -= CONFIG.SCORE_DECREMENT;
    this.updateScore();
    this.currentRound++;
    this.startRound();
  }

  async endGame() {
    await Animations.fadeOut(this.gameScreen);
    this.finalScoreElement.textContent = this.score;
    await Animations.fadeIn(this.gameOverScreen);
  }

  async showScreen(screen) {
    await Animations.fadeOut(this.startScreen);
    await Animations.fadeOut(this.gameScreen);
    await Animations.fadeOut(this.gameOverScreen);
    await Animations.fadeIn(screen);
  }

  // Method for handling "Play Again" button
  async resetAndStartGame() {
    console.log("Resetting game and restoring all images");

    // Clear any timers
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Reset game state
    this.score = 0;
    this.currentRound = 0;
    this.isPlaying = false;
    this.updateScore();

    // IMPORTANT: Check each option and restore images that might be missing
    const options = document.querySelectorAll(".option");
    options.forEach((option, index) => {
      // Remove any feedback classes
      option.classList.remove("correct", "incorrect");

      // Check if the option is missing its image
      const img = option.querySelector("img");
      if (!img) {
        console.log(`Option ${index} is missing its image, restoring it`);

        // Create a new image element
        const newImg = document.createElement("img");
        newImg.alt = `Option ${index + 1}`;
        newImg.style.display = "block";

        // Append the image to the option
        option.appendChild(newImg);
      }

      // Reset pointer events and other styles
      option.style.pointerEvents = "auto";
      option.style.cursor = "pointer";
    });

    // Transition to game screen
    await Animations.fadeOut(this.gameOverScreen);
    await Animations.fadeIn(this.gameScreen);

    // Start the first round
    await this.startRound();
  }
}
