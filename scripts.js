const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = new Image();
playerImage.src = 'pharaoh.png';
const keys = {};
const gravity = 0.8;

const player = {
  x: 50,
  y: 200,
  width: 60,
  height: 100,
  speed: 6,
  dy: 0, // gravity effect, delta y
  jumpPower: 15,
  grounded: false,
};

const platforms = [
  { x: 0, y: 350, width: 1000, height: 100 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
];

let cameraOffsetX = 0;

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function drawPlayer() {
  ctx.drawImage(playerImage, player.x - cameraOffsetX, player.y, player.width, player.height);
}

function drawPlatforms() {
  ctx.fillStyle = 'green';
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x - cameraOffsetX, platform.y, platform.width, platform.height);
  });
}

function updatePlayer() {
  // Horizontal movement
  if (keys['ArrowRight']) {
    if (player.x < canvas.width / 2 || cameraOffsetX >= platforms[platforms.length - 1].x + platforms[platforms.length - 1].width - canvas.width) {
      player.x += player.speed;
    } else {
      cameraOffsetX += player.speed;
    }
  }
  if (keys['ArrowLeft']) {
    if (player.x > canvas.width / 2 || cameraOffsetX <= 0) {
      player.x -= player.speed;
    } else {
      cameraOffsetX -= player.speed;
    }
  }

  // Vertical movement and jumping
  if (keys[' '] && player.grounded) {
    player.dy = -player.jumpPower;
    player.grounded = false;
  }

  player.dy += gravity;
  player.y += player.dy;

  // Collision detection with platforms
  player.grounded = false;
  platforms.forEach(platform => {
    if (player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y) {
      player.y = platform.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
  });

  // Prevent player from falling through the bottom
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawPlatforms();
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();
