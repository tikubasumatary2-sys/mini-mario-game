const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= SOUND ENGINE =================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "jump") {
    osc.frequency.value = 300;
  } else if (type === "coin") {
    osc.frequency.value = 600;
  } else if (type === "hit") {
    osc.frequency.value = 120;
  }

  osc.type = "square";
  gain.gain.value = 0.1;

  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// ================= PLAYER =================
const player = {
  x: 50,
  y: 350,
  w: 30,
  h: 30,
  vx: 0,
  vy: 0,
  jump: false
};

const gravity = 0.8;

// ================= WORLD =================
const platforms = [
  {x: 0, y: 420, w: 900, h: 30},
  {x: 150, y: 340, w: 120, h: 10},
  {x: 320, y: 290, w: 120, h: 10},
  {x: 500, y: 250, w: 120, h: 10},
  {x: 680, y: 300, w: 120, h: 10}
];

let coins = [
  {x: 170, y: 310, r: 8, taken: false},
  {x: 350, y: 260, r: 8, taken: false},
  {x: 520, y: 220, r: 8, taken: false}
];

const enemy = {
  x: 400,
  y: 390,
  w: 30,
  h: 30,
  dir: 1
};

// ================= INPUT =================
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ================= GAME LOOP =================
function update() {

  // movement
  if (keys["ArrowLeft"]) player.vx = -4;
  else if (keys["ArrowRight"]) player.vx = 4;
  else player.vx = 0;

  // jump
  if ((keys["ArrowUp"] || keys[" "]) && !player.jump) {
    player.vy = -13;
    player.jump = true;
    playSound("jump");
  }

  // gravity
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // platform collision
  player.jump = true;
  for (let p of platforms) {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y < p.y + p.h &&
      player.y + player.h > p.y
    ) {
      if (player.vy > 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.jump = false;
      }
    }
  }

  // coins
  coins.forEach(c => {
    if (!c.taken &&
      player.x < c.x + c.r &&
      player.x + player.w > c.x &&
      player.y < c.y + c.r &&
      player.y + player.h > c.y
    ) {
      c.taken = true;
      playSound("coin");
    }
  });

  // enemy movement
  enemy.x += enemy.dir * 2;
  if (enemy.x < 300 || enemy.x > 600) enemy.dir *= -1;

  // enemy collision
  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) {
    playSound("hit");
    player.x = 50;
    player.y = 350;
  }

  // boundaries
  if (player.x < 0) player.x = 0;

  draw();
  requestAnimationFrame(update);
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // platforms
  ctx.fillStyle = "brown";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // coins
  coins.forEach(c => {
    if (!c.taken) {
      ctx.fillStyle = "gold";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // enemy
  ctx.fillStyle = "purple";
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);

  // goal
  ctx.fillStyle = "green";
  ctx.fillRect(850, 380, 20, 40);

  ctx.fillStyle = "black";
  ctx.fillText("GOAL →", 820, 370);
}

update();
