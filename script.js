const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let lives = 3;
let level = 1;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  dx: 0,
  canShoot: true,
  isDestroyed: false
};

const explosionSound = new Audio('explosion.mp3');
const levelUpSound = new Audio('level-up.mp3');

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);

function movePlayer(e) {
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === 'ArrowRight') player.dx = player.speed;
  if (e.key === ' ') shootBullet();
  if (e.key === 'r' && lives === 0) resetGame();
}

function stopPlayer(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
}

function shootBullet() {
  if (player.canShoot && !player.isDestroyed) {
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
    player.canShoot = false;
    setTimeout(() => player.canShoot = true, 500);
  }
}

function drawPlayer() {
  if (!player.isDestroyed) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y - player.height / 2);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.closePath();
    ctx.fill();
  }
}

function updatePlayer() {
  player.x += player.dx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function createEnemies() {
  const rows = 3 + level;
  const cols = 10;
  const enemyWidth = 40;
  const enemyHeight = 40;
  const padding = 10;
  const offsetTop = 30;
  const offsetLeft = 30;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = c * (enemyWidth + padding) + offsetLeft;
      let y = r * (enemyHeight + padding) + offsetTop;
      enemies.push({ x, y, width: enemyWidth, height: enemyHeight, speed: 1 + level * 0.5 });
    }
  }
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height));
}

function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.x += enemy.speed;
    if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
      enemy.speed = -enemy.speed;
      enemy.y += enemy.height;
    }
    if (enemy.y + enemy.height > canvas.height) {
      lives--;
      enemies.splice(index, 1);
    }
  });
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
}

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) bullets.splice(index, 1);
  });
}

function detectCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
        explosionSound.play();
        score += 10;
        if (enemies.length === 0) {
          level++;
          levelUpSound.play();
          createEnemies();
        }
      }
    });
  });

  enemies.forEach((enemy, eIndex) => {
    if (enemy.x < player.x + player.width && enemy.x + enemy.width > player.x && enemy.y < player.y + player.height && enemy.y + enemy.height > player.y) {
      player.isDestroyed = true;
      explosionSound.play();
      lives--;
      enemies.splice(eIndex, 1);
    }
  });
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Lives: ${lives}`, 10, 50);
  ctx.fillText(`Level: ${level}`, 10, 80);
}

function gameOver() {
  ctx.fillStyle = 'red';
  ctx.font = '40px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Press "R" to Restart', canvas.width / 2 - 70, canvas.height / 2 + 30);
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  enemies = [];
  bullets = [];
  player.x = canvas.width / 2 - 20;
  player.isDestroyed = false;
  createEnemies();
  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawScore();

  updatePlayer();
  updateEnemies();
  updateBullets();
  detectCollisions();

  if (lives > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    gameOver();
  }
}

createEnemies();
gameLoop();
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

leftBtn.addEventListener('touchstart', () => { player.dx = -player.speed; });
rightBtn.addEventListener('touchstart', () => { player.dx = player.speed; });
shootBtn.addEventListener('touchstart', shootBullet);

leftBtn.addEventListener('touchend', () => { player.dx = 0; });
rightBtn.addEventListener('touchend', () => { player.dx = 0; });

