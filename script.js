
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const box = 25;
  const rows = canvas.height / box;
  const cols = canvas.width / box;

  let snake, food, blueFood, greenFood, score, topScore, lowestScore, interval, direction;
  let frameRate = 200;
  let difficulty = 'easy';
  let foodCounter = 0;
  let blueFoodTimeout, blinkInterval, progressInterval;
  let greenFoodShown = false;
  let snakeColor = "green";
  let rgbInterval = null;

  const gameOverSound = document.getElementById("gameOverSound");
  const eatSound = document.getElementById("eatSound");
  const greenEatSound = document.getElementById("greenEatSound");
  const blueAppearSound = document.getElementById("blueAppearSound");
  const blueBar = document.getElementById("blueBarContainer");
  const blueProgress = document.getElementById("blueProgressBar");

  document.getElementById("difficulty").addEventListener("change", (e) => {
    difficulty = e.target.value;
    setDifficulty();
  });

  document.getElementById("playBtn").addEventListener("click", startGame);

  document.getElementById("volumeControl").addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value);
    gameOverSound.volume = volume;
    eatSound.volume = volume;
    greenEatSound.volume = volume;
    blueAppearSound.volume = volume;
  });

  document.addEventListener("keydown", e => {
    const key = e.key;
    if (!interval && ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(key)) {
      startGame();
    }
    if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    else if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  });

  document.getElementById("colorBtn").addEventListener("click", () => {
    document.getElementById("colorPicker").click();
  });

  document.getElementById("colorPicker").addEventListener("input", (e) => {
    snakeColor = e.target.value;
    document.getElementById("colorBtn").style.backgroundColor = snakeColor;
    if (rgbInterval) {
      clearInterval(rgbInterval);
      rgbInterval = null;
      document.getElementById("rgbToggleBtn").textContent = "ON";
    }
  });

  document.getElementById("rgbToggleBtn").addEventListener("click", () => {
    if (rgbInterval) {
      clearInterval(rgbInterval);
      rgbInterval = null;
      document.getElementById("rgbToggleBtn").textContent = "ON";
    } else {
      rgbInterval = setInterval(() => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        snakeColor = `rgb(${r},${g},${b})`;
        document.getElementById("colorBtn").style.backgroundColor = snakeColor;
      }, 300);
      document.getElementById("rgbToggleBtn").textContent = "OFF";
    }
  });

  function setDifficulty() {
    frameRate = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 150 : 100;
  }

  function startGame() {
    clearInterval(interval);
    clearTimeout(blueFoodTimeout);
    clearInterval(blinkInterval);
    clearInterval(progressInterval);
    snake = [{ x: 5 * box, y: 5 * box }];
    direction = "RIGHT";
    food = spawnFood();
    blueFood = null;
    greenFood = null;
    score = 0;
    foodCounter = 0;
    greenFoodShown = false;
    blueBar.style.display = "none";
    updateScoreDisplay();
    hideMessages();
    interval = setInterval(draw, frameRate);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "lime" : snakeColor;
      ctx.fillRect(s.x, s.y, box, box);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    if (blueFood) {
      ctx.fillStyle = blueFood.blink ? (blueFood.blinkState ? "blue" : "black") : "blue";
      ctx.fillRect(blueFood.x, blueFood.y, box, box);
    }

    if (greenFood) {
      ctx.fillStyle = "limegreen";
      ctx.fillRect(greenFood.x, greenFood.y, box, box);
    }

    let head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
      case "LEFT": head.x -= box; break;
      case "UP": head.y -= box; break;
      case "RIGHT": head.x += box; break;
      case "DOWN": head.y += box; break;
    }

    if (head.x === food.x && head.y === food.y) {
      score++;
      eatSound.play();
      foodCounter++;
      food = spawnFood();
      if (foodCounter % 10 === 0) spawnBlueFood();
    } else if (blueFood && head.x === blueFood.x && head.y === blueFood.y) {
      score += 10;
      eatSound.play();
      blueFood = null;
      blueBar.style.display = "none";
      clearTimeout(blueFoodTimeout);
      clearInterval(progressInterval);
    } else if (greenFood && head.x === greenFood.x && head.y === greenFood.y) {
      score++;
      greenEatSound.play();
      greenFood = null;
      greenFoodShown = false;
    } else {
      snake.pop();
    }

    if (!greenFoodShown && score === topScore && score !== 0) {
      greenFood = spawnFood();
      greenFoodShown = true;
    }

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);
    updateScoreDisplay();
  }

  function spawnFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box
      };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }

  function spawnBlueFood() {
    let duration = difficulty === 'easy' ? 10000 : difficulty === 'medium' ? 7000 : 5000;
    blueFood = spawnFood();
    blueAppearSound.play(); // ← تشغيل صوت ظهور الحبة الزرقاء
    blueFood.blink = false;
    blueFood.blinkState = true;
    blueBar.style.display = "block";
    blueProgress.style.width = "100%";

    const steps = 100;
    let step = 0;
    progressInterval = setInterval(() => {
      step++;
      blueProgress.style.width = `${100 - step}%`;
      if (step >= steps) {
        clearInterval(progressInterval);
      }
    }, duration / steps);

    setTimeout(() => blueFood.blink = true, duration - 2000);
    blinkInterval = setInterval(() => {
      if (!blueFood) return clearInterval(blinkInterval);
      blueFood.blinkState = !blueFood.blinkState;
    }, 250);
    blueFoodTimeout = setTimeout(() => {
      blueFood = null;
      blueBar.style.display = "none";
      clearInterval(blinkInterval);
      clearInterval(progressInterval);
    }, duration);
  }

  function updateScoreDisplay() {
    document.getElementById("score").textContent = score;
  }

  function gameOver() {
    clearInterval(interval);
    blueBar.style.display = "none";
    clearInterval(progressInterval);
    document.getElementById("gameOver").style.display = "block";
    if (score > topScore) {
      topScore = score;
      localStorage.setItem("topScore", topScore);
      document.getElementById("topScore").textContent = topScore;
      document.getElementById("newTopScore").style.display = "block";
    }
    if ((score < lowestScore || lowestScore === 0) && score > 0) {
      lowestScore = score;
      localStorage.setItem("lowestScore", lowestScore);
      document.getElementById("lowestScore").textContent = lowestScore;
    }
    gameOverSound.play();
  }

  function hideMessages() {
    document.querySelectorAll(".message").forEach(el => el.style.display = "none");
    document.getElementById("newTopScore").style.display = "none";
  }

  topScore = parseInt(localStorage.getItem("topScore")) || 0;
  lowestScore = parseInt(localStorage.getItem("lowestScore")) || 0;
  document.getElementById("topScore").textContent = topScore;
  document.getElementById("lowestScore").textContent = lowestScore;
