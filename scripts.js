const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load assets
const playerImage = new Image();
playerImage.src = 'assets/pharaoh.png';
const bgMusic = document.getElementById('bgMusic');
const jumpSound = document.getElementById('jumpSound');

// Declare essential variables
let cameraOffsetX = 0;
const gravity = 0.8;
const keys = {};

// Platforms
const platforms = [
  { x: 0, y: 350, width: 10000, height: 100 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
  { x: 900, y: 200, width: 100, height: 10 },
  { x: 1100, y: 300, width: 100, height: 10 },
  { x: 1300, y: 200, width: 100, height: 10 },
];

// Load player object
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

function setupEventListeners() {
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);
}

function drawPlayer() {
  ctx.drawImage(playerImage, player.x - cameraOffsetX, player.y, player.width, player.height);
}

class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x - cameraOffsetX, this.y, this.width, this.height);
    if (this.type === 'normal') {
      ctx.fillStyle = 'sienna';
    } else if (this.type === 'powerup') {
      ctx.fillStyle = 'gold'; // Change color for powerup platform
    } else {
      ctx.fillStyle = 'gray';
    }
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw a circle in the middle of the powerup platform
    if (this.type === 'powerup') {
      ctx.beginPath();
      ctx.arc(this.x - cameraOffsetX + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2, false);
      ctx.fillStyle = '#6b5c00'; // Change this to the color you want for the circle
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
  }
}

function drawPlatforms() {
  platforms.forEach(p => {
    const platform = new Platform(p.x, p.y, p.width, p.height, p.type || 'normal');
    platform.draw();
  });
}

const powerupPlatform = new Platform(150, 130, 60, 60, 'powerup');
platforms.push(powerupPlatform);

function drawPyramids() {
  const bigPyramidY = 200; // Y-coordinate for big pyramid
  const smallPyramidY = 250; // Y-coordinate for small pyramid
  const offset = 80; // Offset value
  const pyramidSpacing = 600; // Spacing between pyramids

// Generate array of x-coordinates for pyramids
const pyramidXCoordinates = [];
for (let i = -cameraOffsetX - pyramidSpacing; i < cameraOffsetX + canvas.width + pyramidSpacing; i += pyramidSpacing) {
  pyramidXCoordinates.push(i);
}

  pyramidXCoordinates.forEach(pyramidX => {
    // Drawing big pyramid
    let adjustedX = pyramidX - cameraOffsetX * 0.2 + offset; // Apply parallax and offset
    drawPyramid(ctx, adjustedX, bigPyramidY, 300, 180, 'sandybrown'); // Pass color as an argument

    // Drawing small pyramid
    adjustedX = pyramidX - cameraOffsetX * 0.2 - offset; // Apply parallax and reverse offset
    drawPyramid(ctx, adjustedX, smallPyramidY, 200, 120, 'darkgoldenrod'); // Pass color as an argument
  });
}

function drawPyramid(ctx, x, y, width, height, color) {
  ctx.beginPath();
  ctx.moveTo(x, y); // Top of the pyramid
  ctx.lineTo(x - width / 2, y + height); // Bottom left
  ctx.lineTo(x + width / 2, y + height); // Bottom right
  ctx.closePath();
  ctx.fillStyle = color; // Use color argument
  ctx.fill();
  ctx.strokeStyle = 'sienna';
  ctx.stroke();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 10;
}

function updateCamera() {
  let maxOffsetX = platforms.reduce((max, p) => Math.max(max, p.x + p.width), 0) - canvas.width + player.width;
  let playerCenterX = player.x + player.width / 2;

  if (playerCenterX > canvas.width / 2 && playerCenterX < maxOffsetX + canvas.width / 2) {
      cameraOffsetX = playerCenterX - canvas.width / 2;
  }
  cameraOffsetX = Math.max(0, Math.min(cameraOffsetX, maxOffsetX));
}

function playerControls() {
  if (keys['ArrowRight']) {
      let newX = player.x + player.speed;
      if (!isColliding(newX, player.y, player.width, player.height)) {
          player.x = newX;
      }
  }

    if (keys['ArrowLeft']) {
        let newX = player.x - player.speed;
        if (newX > 0 && !isColliding(newX, player.y, player.width, player.height)) {
            player.x = newX;
        }
    }

    if (keys[' ']) {
        if (player.grounded) {
            player.dy = -player.jumpPower;
            player.grounded = false;
            jumpSound.play();
        }
    }
  }
  
  function updatePlayer() {
    player.dy += gravity;
    let newY = player.y + player.dy;
    if (!isColliding(player.x, newY, player.width, player.height)) {
        player.y = newY;
    } else {
        if (player.dy > 0) { // Falling down
            while (isColliding(player.x, newY, player.width, player.height)) {
                newY--;
            }
            player.y = newY;
            player.dy = -player.dy * 0.3; // Bounce back with 0.3 times the velocity
            player.grounded = true;
        } else if (player.dy < 0) { // Jumping up
            while (isColliding(player.x, newY, player.width, player.height)) {
                newY++;
            }
            player.y = newY;
            player.dy = -player.dy * 0.3; // Bounce back with 0.3 times the velocity
        }
    }

    updateCamera();
}

function isColliding(x, y, width, height) {
  const playerX = x - cameraOffsetX; // Subtract cameraOffsetX from player's x-coordinate

  return platforms.some(p => {
      const playerLeft = playerX;
      const playerRight = playerX + width;
      const playerTop = y;
      const playerBottom = y + height;

      const platformLeft = p.x - cameraOffsetX; // Subtract cameraOffsetX from platform's x-coordinate
      const platformRight = p.x + p.width - cameraOffsetX; // Subtract cameraOffsetX from platform's x-coordinate
      const platformTop = p.y;
      const platformBottom = p.y + p.height;

      return !(playerLeft > platformRight || 
               playerRight < platformLeft || 
               playerTop > platformBottom || 
               playerBottom < platformTop);
  });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPyramids();
      // Reset shadow properties so they don't affect other drawings
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    drawPlatforms();
    drawPlayer();
    playerControls();
    updatePlayer();
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
  setupEventListeners();
  bgMusic.volume = 0.5;
  bgMusic.play();
  gameLoop();
}