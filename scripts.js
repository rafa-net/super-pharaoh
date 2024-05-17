const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = new Image();
playerImage.src = 'pharaoh.png'; // Make sure this path is correct
const keys = {};
const gravity = 0.8;
const bgMusic = document.getElementById('bgMusic');
const jumpSound = document.getElementById('jumpSound');

const player = {
  x: 50,
  y: 200,
  width: 60,
  height: 100,
  speed: 6,
  dy: 0,
  jumpPower: 15,
  grounded: false,
};

const platforms = [
  { x: 0, y: 350, width: 10000, height: 100 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
  { x: 900, y: 150, width: 100, height: 10 },
  { x: 1100, y: 150, width: 100, height: 10 },
  { x: 1300, y: 150, width: 100, height: 10 },
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
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - cameraOffsetX, platform.y, platform.width, platform.height);
  });
}

function updatePlayer() {
  if (keys['ArrowRight']) {
    let nextX = player.x + player.speed;
    let nextRight = nextX + player.width;
    let rightBoundary = cameraOffsetX + canvas.width;
    let moveRight = true;

    // Check if the player is trying to move into a platform
    platforms.forEach(platform => {
      if (nextRight > platform.x - cameraOffsetX &&
          player.x < platform.x + platform.width - cameraOffsetX &&
          player.y + player.height > platform.y &&
          player.y < platform.y + platform.height) {
        moveRight = false;
      }
    });

    if (moveRight) {
      if (nextRight < rightBoundary) {
        player.x = nextX;
      } else {
        cameraOffsetX += player.speed;
      }
    }
  }
  
  if (keys['ArrowLeft'] && player.x > 0) {
    let nextX = player.x - player.speed;
    let moveLeft = true;

    // Check if the player is trying to move into a platform
    platforms.forEach(platform => {
      if (nextX < platform.x + platform.width - cameraOffsetX &&
          player.x > platform.x - cameraOffsetX &&
          player.y + player.height > platform.y &&
          player.y < platform.y + platform.height) {
        moveLeft = false;
      }
    });

    if (moveLeft) {
      if (player.x > canvas.width * 0.5 || cameraOffsetX === 0) {
        player.x = nextX;
      } else {
        cameraOffsetX -= player.speed;
      }
    }
  }

  if (keys[' '] && player.grounded) {
    player.dy = -player.jumpPower;
    player.grounded = false;
    playJumpSound();
  }

  player.dy += gravity;
  player.y += player.dy;

  // Ground collision
  player.grounded = false;
  platforms.forEach(platform => {
    if (player.x < platform.x + platform.width - cameraOffsetX &&
        player.x + player.width > platform.x - cameraOffsetX &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y) {
      player.y = platform.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
  });

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }
}

function startBackgroundMusic() {
  bgMusic.volume = 0.5;
  bgMusic.play();
}

window.onload = startBackgroundMusic;

function playJumpSound() {
  jumpSound.play();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawPlatforms();
  updatePlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();
