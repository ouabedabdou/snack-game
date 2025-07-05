
const game = document.getElementById('game');
const world = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const gameOverText = document.getElementById('gameOverText');
const scoreBoard = document.getElementById('scoreBoard');
const coinCounter = document.getElementById('coinCounter');
const coinSound = document.getElementById('coinSound');
const jumpSound = document.getElementById('jumpSound');
const explosionSound = document.getElementById('explosionSound');
const explosionImage = document.getElementById('explosionImage');

const groundHeight = 100;
const playerWidth = 120;
const playerHeight = 120;
const gravity = 0.7;
const moveSpeed = 6;
const jumpPower = 15;
const platformWidth = 200;
const platformHeight = 20;

let position, velocity, cameraX, keys, onGround, score, coinsCollected, gameRunning, platforms, coins, nextPlatformX;
let player;

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

startBtn.addEventListener('click', startGame);

function createPlatform(x, y) {
  const plat = document.createElement('div');
  plat.className = 'platform';
  plat.style.left = x + 'px';
  plat.style.top = y + 'px';
  world.appendChild(plat);
  platforms.push({ el: plat, x, y, width: platformWidth, height: platformHeight });
}

function createCoin(x, y) {
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.style.left = x + 'px';
  coin.style.top = y + 'px';
  world.appendChild(coin);
  coins.push({ el: coin, x, y, width: 25, height: 25 });
}

function startGame() {
  world.innerHTML = '<div class="ground"></div><div class="player" id="player"></div>';
  position = { x: 100, y: 0 };
  velocity = { x: 0, y: 0 };
  cameraX = 0;
  score = 0;
  coinsCollected = 0;
  keys = {};
  onGround = false;
  gameRunning = true;
  platforms = [];
  coins = [];

  player = document.getElementById('player');

  for (let i = 0; i < 10; i++) {
    const x = i * 300 + 50;
    const y = game.clientHeight - groundHeight - 100 - Math.random() * 150;
    console.log(y);
    createPlatform(x, y);
    createCoin(x + 80, y - 30);
  }

  nextPlatformX = 10 * 300 + 50;

  const firstPlatform = platforms.find(p => 100 + playerWidth > p.x && 100 < p.x + platformWidth);
  if (firstPlatform) {
    position.x = 100;
    position.y = firstPlatform.y - playerHeight;
    velocity.y = 0;
    onGround = true;
  }

  player.style.display = 'block';
  explosionImage.style.display = 'none';
  gameOverText.style.display = 'none';
  startBtn.style.display = 'none';
  scoreBoard.textContent = 'Points: 0';
  coinCounter.textContent = 'Coins: 0';

  requestAnimationFrame(gameLoop);
}

function generatePlatformsIfNeeded() {
  while (nextPlatformX < position.x + 1000) {
    const y = game.clientHeight - groundHeight - 100 - Math.random() * 150;
    createPlatform(nextPlatformX, y);
    createCoin(nextPlatformX + 80, y - 30);
    nextPlatformX += 300;
  }
}

function endGame() {
  gameRunning = false;
  gameOverText.style.display = 'block';
  startBtn.style.display = 'block';
  player.style.display = 'none';
  explosionImage.style.left = (position.x - cameraX) + 'px';
  explosionImage.style.top = position.y + 'px';
  explosionImage.style.display = 'block';

  // تشغيل صوت الانفجار
  explosionSound.currentTime = 0;
  explosionSound.play();
}

function gameLoop() {
  if (!gameRunning) return;

  velocity.x = 0;
  if (keys['arrowright'] || keys['d']) velocity.x = moveSpeed;
  else if (keys['arrowleft'] || keys['a']) velocity.x = -moveSpeed;

  if ((keys['arrowup'] || keys['w'] || keys[' ']) && onGround) {
    velocity.y = -jumpPower;
    onGround = false;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  velocity.y += gravity;
  position.x += velocity.x;
  position.y += velocity.y;
  onGround = false;

  for (let plat of platforms) {
    const nextBottom = position.y + playerHeight;
    const prevBottom = position.y + playerHeight - velocity.y;
    const playerMidX = position.x + playerWidth / 2;

    const isLanding =
      prevBottom <= plat.y &&
      nextBottom >= plat.y &&
      playerMidX > plat.x &&
      playerMidX < plat.x + plat.width;

    if (isLanding) {
      position.y = plat.y - playerHeight;
      velocity.y = 0;
      onGround = true;
    }
  }

  if (position.y + playerHeight > game.clientHeight - groundHeight) {
    endGame();
    return;
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    if (
      position.x < coin.x + coin.width &&
      position.x + playerWidth > coin.x &&
      position.y < coin.y + coin.height &&
      position.y + playerHeight > coin.y
    ) {
      coinsCollected++;
      score++;
      coin.el.remove();
      coins.splice(i, 1);
      coinSound.currentTime = 0;
      coinSound.play();
    }
  }

  cameraX = position.x - 150;
  if (cameraX < 0) cameraX = 0;
  world.style.left = -cameraX + 'px';

  player.style.left = position.x + 'px';
  player.style.top = position.y + 'px';

  scoreBoard.textContent = 'Points: ' + score;
  coinCounter.textContent = 'Coins: ' + coinsCollected;

  generatePlatformsIfNeeded();

  requestAnimationFrame(gameLoop);
}

// أزرار اللمس
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// تحكم اللمس
leftBtn.addEventListener('touchstart', () => keys['arrowleft'] = true);
leftBtn.addEventListener('touchend', () => keys['arrowleft'] = false);

rightBtn.addEventListener('touchstart', () => keys['arrowright'] = true);
rightBtn.addEventListener('touchend', () => keys['arrowright'] = false);

jumpBtn.addEventListener('touchstart', () => {
  if (onGround) {
    velocity.y = -jumpPower;
    onGround = false;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});
