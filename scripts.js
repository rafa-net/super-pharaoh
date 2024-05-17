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
    let maxOffsetX = platforms.reduce((max, p) => Math.max(max, p.x + p.width), 0) - canvas.width;
    let playerCenterX = player.x + player.width / 2;

    if (playerCenterX > canvas.width / 2 && playerCenterX < maxOffsetX + canvas.width / 2) {
        cameraOffsetX = playerCenterX - canvas.width / 2;
    }
    cameraOffsetX = Math.max(0, Math.min(cameraOffsetX, maxOffsetX));
}

function updatePlayer() {
    if (keys['ArrowRight']) {
        let newX = player.x + player.speed;
        if (newX < platforms[platforms.length - 1].x + platforms[platforms.length - 1].width - player.width && !isColliding(newX, player.y, player.width, player.height)) {
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
        while (isColliding(player.x, newY, player.width, player.height)) {
            newY--;
        }
        player.y = newY;
        player.dy = 0;
        player.grounded = true;
    }

    updateCamera();
}

function isColliding(x, y, width, height) {
    return platforms.some(p => x + width > p.x - cameraOffsetX && x < p.x + p.width - cameraOffsetX && y + height > p.y && y < p.y + p.height);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPyramids();
    drawPlatforms();
    drawPlayer();
    updatePlayer();
    console.log(player.x, player.y, cameraOffsetX, player.dy, player.grounded, platforms);
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
  bgMusic.volume = 0.5;
  bgMusic.play();
  gameLoop();
}
