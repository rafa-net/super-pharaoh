const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Assets loading
const playerImage = new Image();
playerImage.src = 'pharaoh.png'; // Ensure this path is correct
const keys = {};
const gravity = 0.8;
const bgMusic = document.getElementById('bgMusic');
const jumpSound = document.getElementById('jumpSound');

const platforms = [
  { x: 0, y: 350, width: 10000, height: 100 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
  { x: 900, y: 200, width: 100, height: 10 },
  { x: 1100, y: 300, width: 100, height: 10 },
  { x: 1300, y: 200, width: 100, height: 10 },
  { x: 300, y: 300, width: 100, height: 10 },
  { x: 450, y: 250, width: 100, height: 10 },
  { x: 600, y: 200, width: 100, height: 10 },
  { x: 750, y: 150, width: 100, height: 10 },
];

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

// Load platform image and create gradient at the start of your game
let platformImage = new Image();
platformImage.src = './pyr-texture.png';

let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#725900');
gradient.addColorStop(1, '#ffe28e');

function drawPlatforms() {
  platforms.forEach(platform => {
    // Draw platform with rounded corners
    let radius = 10; // Adjust as needed
    ctx.beginPath();
    ctx.moveTo(platform.x - cameraOffsetX + radius, platform.y);
    ctx.lineTo(platform.x - cameraOffsetX + platform.width - radius, platform.y);
    ctx.arcTo(platform.x - cameraOffsetX + platform.width, platform.y, platform.x - cameraOffsetX + platform.width, platform.y + radius, radius);
    ctx.lineTo(platform.x - cameraOffsetX + platform.width, platform.y + platform.height - radius);
    ctx.arcTo(platform.x - cameraOffsetX + platform.width, platform.y + platform.height, platform.x - cameraOffsetX + platform.width - radius, platform.y + platform.height, radius);
    ctx.lineTo(platform.x - cameraOffsetX + radius, platform.y + platform.height);
    ctx.arcTo(platform.x - cameraOffsetX, platform.y + platform.height, platform.x - cameraOffsetX, platform.y + platform.height - radius, radius);
    ctx.lineTo(platform.x - cameraOffsetX, platform.y + radius);
    ctx.arcTo(platform.x - cameraOffsetX, platform.y, platform.x - cameraOffsetX + radius, platform.y, radius);
    ctx.closePath();

    // Fill platform with image texture and gradient
    ctx.fillStyle = ctx.createPattern(platformImage, 'repeat');
    ctx.fill();
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}

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

function updatePlayer() {
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
            player.dy = -player.dy * 0.5; // Bounce back with half the velocity
            player.grounded = true;
        } else if (player.dy < 0) { // Jumping up
            while (isColliding(player.x, newY, player.width, player.height)) {
                newY++;
            }
            player.y = newY;
            player.dy = -player.dy * 0.5; // Bounce back with half the velocity
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
    updatePlayer();
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
  bgMusic.volume = 0.5;
  bgMusic.play();
  gameLoop();
}
