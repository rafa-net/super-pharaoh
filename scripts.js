const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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

function drawPlatforms() {
  ctx.fillStyle = 'goldenrod';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - cameraOffsetX, platform.y, platform.width, platform.height);
  });
}

function drawPyramids() {
  const bigPyramidPositions = [100, 1300, 2500]; // Example positions for big pyramids
  const smallPyramidPositions = [700, 1900, 3100]; // Example positions for small pyramids
  const offset = 50; // Offset value

  bigPyramidPositions.forEach(pos => {
    drawPyramid(ctx, pos - cameraOffsetX * 0.5 + offset, 250, 300, 180); // Draw big pyramid with offset
  });

  smallPyramidPositions.forEach(pos => {
    drawPyramid(ctx, pos - cameraOffsetX * 0.5 - offset, 250, 200, 120); // Draw small pyramid with offset
  });
}

function drawPyramid(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - width / 2, y + height);
  ctx.lineTo(x + width / 2, y + height);
  ctx.closePath();
  ctx.fillStyle = 'sandybrown';
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
    console.log(player.x, player.y, cameraOffsetX, player.dy, player.grounded);
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
  bgMusic.volume = 0.5;
  bgMusic.play();
  gameLoop();
}
