const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = new Image();
playerImage.src = 'pharaoh.png';  // Make sure the path to your image is correct
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
  { x: 0, y: 350, width: 1000, height: 100 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
  // Adding new square platforms with power-up mechanics
  { x: 900, y: 100, width: 50, height: 50, hasPowerUp: true, powerUpActive: false },
];

let cameraOffsetX = 0;
let powerUps = [];

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

function activatePowerUp(platform) {
  if (!platform.powerUpActive) {
    powerUps.push({
      x: platform.x,
      y: platform.y - 20,
      width: 20,
      height: 20,
      speed: 2,
    });
    platform.powerUpActive = true;
  }
}

function drawPowerUps() {
  ctx.fillStyle = 'red';
  powerUps.forEach(powerUp => {
    ctx.fillRect(powerUp.x - cameraOffsetX, powerUp.y, powerUp.width, powerUp.height);
    powerUp.x += powerUp.speed;  // Move horizontally
  });
}

function updatePowerUps() {
  powerUps.forEach(powerUp => {
    if (powerUp.x - cameraOffsetX > canvas.width) {
      const index = powerUps.indexOf(powerUp);
      powerUps.splice(index, 1);
    }
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

      // Activate power-up if applicable
      if (platform.hasPowerUp && !platform.powerUpActive) {
        activatePowerUp(platform);
      }
    }
  });

  // Prevent player from falling through the bottom
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }
}

// Function to start background music
function startBackgroundMusic() {
  bgMusic.volume = 0.5;  // Set volume to 50%
  bgMusic.play();
}

// Function to play jump sound
function playJumpSound() {
  jumpSound.play();
}

// Adjust volume if needed
function adjustVolume(volumeLevel) {
  bgMusic.volume = volumeLevel; // Range: 0.0 to 1.0
}

// To start background music when the game loads
window.onload = startBackgroundMusic;

// To play jump sound on jumping
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && player.grounded) {  // Assuming spacebar triggers a jump
      playJumpSound();
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawPlatforms();
  drawPowerUps();
  updatePlayer();
  updatePowerUps();
  requestAnimationFrame(gameLoop);
}

gameLoop();
