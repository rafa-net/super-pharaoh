const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = new Image();
playerImage.src = 'pharaoh.png'; // Ensure this path is correct
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
  ctx.fillStyle = 'goldenrod';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - cameraOffsetX, platform.y, platform.width, platform.height);
  });
}

function drawPyramids() {
  const pyramidPositions = [100, 700, 1300, 1900, 2500, 3100]; // Example pyramid positions
  pyramidPositions.forEach(pos => {
    drawPyramid(ctx, pos - cameraOffsetX * 0.5, 250, 200, 120); // Adjust x for parallax effect
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
}

function updateCamera() {
    // Calculate the right edge of the camera based on its current offset
    let cameraRightEdge = cameraOffsetX + canvas.width;

    // Calculate the player's center position
    let playerCenterX = player.x + player.width / 2;

    // Update the camera offset based on player movement, keeping the player in the center of the canvas if possible
    if (playerCenterX > canvas.width / 2 && playerCenterX < (gameObjects.platforms[gameObjects.platforms.length - 1].x + gameObjects.platforms[gameObjects.platforms.length - 1].width) - canvas.width / 2) {
        cameraOffsetX = playerCenterX - canvas.width / 2;
    }

    // Ensure the camera does not scroll beyond the level's boundaries
    cameraOffsetX = Math.max(0, cameraOffsetX); // Prevent scrolling too far left
    cameraOffsetX = Math.min(cameraOffsetX, gameObjects.platforms[gameObjects.platforms.length - 1].x + gameObjects.platforms[gameObjects.platforms.length - 1].width - canvas.width); // Prevent scrolling too far right
}

function updatePlayer() {
    let proposedX = player.x + (keys['ArrowRight'] ? player.speed : 0) - (keys['ArrowLeft'] ? player.speed : 0);

    // Simple boundary checks
    if (proposedX >= 0 && proposedX <= gameObjects.platforms[gameObjects.platforms.length - 1].x + gameObjects.platforms[gameObjects.platforms.length - 1].width - player.width) {
        player.x = proposedX;
    }

    // Gravity and vertical movement
    player.dy += gravity;
    let proposedY = player.y + player.dy;

    // Check for collisions with platforms for vertical movement
    if (!isColliding(player.x, proposedY, player.width, player.height)) {
        player.y = proposedY;
    } else {
        handleVerticalCollision();
    }

    checkGroundCollision();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCamera();
    drawGameObjects();
    drawPlayer();
    updatePlayer();
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
    bgMusic.volume = 0.5;
    bgMusic.play();
    gameLoop();
}


function updatePlayer() {
  let moveRight = keys['ArrowRight'];
  let moveLeft = keys['ArrowLeft'];

  if (moveRight && canMove(player.x + player.speed, player.y)) {
    if (player.x < canvas.width * 0.5 || cameraOffsetX >= platforms[platforms.length - 1].x + platforms[platforms.length - 1].width - canvas.width) {
      player.x += player.speed;
    } else {
      cameraOffsetX += player.speed;
    }
  }

  if (moveLeft && canMove(player.x - player.speed, player.y)) {
    if (player.x > canvas.width * 0.5 || cameraOffsetX <= 0) {
      player.x -= player.speed;
    } else {
      cameraOffsetX -= player.speed;
    }
  }

  if (keys[' '] && player.grounded) {
    player.dy = -player.jumpPower;
    player.grounded = false;
    jumpSound.play();
  }

  // Gravity
  player.dy += gravity;
  player.y += player.dy;

  // Check ground collision
  checkGroundCollision();

  // Prevent player from falling off the bottom of the canvas
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.grounded = true;
    player.dy = 0;
  }
}

function canMove(x, y) {
  return !platforms.some(p => x + player.width > p.x - cameraOffsetX && x < p.x + p.width - cameraOffsetX && y + player.height > p.y && y < p.y + p.height);
}

function checkGroundCollision() {
  player.grounded = platforms.some(p => {
    if (player.x + player.width > p.x - cameraOffsetX && player.x < p.x + p.width - cameraOffsetX &&
        player.y + player.height > p.y && player.y < p.y + p.height) {
      player.y = p.y - player.height;
      player.dy = 0;
      return true;
    }
    return false;
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPyramids(); // Draw parallax background
  drawPlatforms();
  drawPlayer();
  updatePlayer();
  console.log("Player position:", player.x, player.y, player.dy);
  console.log("Camera offset:", cameraOffsetX);
  requestAnimationFrame(gameLoop);
}

window.onload = function() {
  bgMusic.volume = 0.5;
  bgMusic.play();
  gameLoop();
}
