const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const GRAVITY = 0.7;
const MOVEMENT_SPEED = 5;
const JUMP_SPEED = 19;
let gameState = GAME_STATE.IDLE;

// #region Instantiation

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: '/assets/images/background.png'
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: '/assets/images/shop.png',
  scale: 2.75,
  framesMax: 6
});

const player = new Fighter({
  position: {
    x: 200,
    y: 10
  },
  velocity: {
    x: 0,
    y: 10
  },
  imageSrc: '/assets/images/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: '/assets/images/samuraiMack/Idle.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: '/assets/images/samuraiMack/Run.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: '/assets/images/samuraiMack/Jump.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: '/assets/images/samuraiMack/Fall.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: '/assets/images/samuraiMack/Attack1.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: '/assets/images/samuraiMack/Take Hit - white silhouette.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: '/assets/images/samuraiMack/Death.png',
      imageSrcFlipped: '/assets/images/samuraiMack-flipped/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    offsetFlipped: {
      x: -185,
      y: 50
    },
    width: 160,
    height: 50
  },
  defaultOrientation: ORIENTATION.RIGHT
});

const enemy = new Fighter({
  position: {
    x: 780,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  imageSrc: '/assets/images/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170
  },
  sprites: {
    idle: {
      imageSrc: '/assets/images/kenji/Idle.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: '/assets/images/kenji/Run.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: '/assets/images/kenji/Jump.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: '/assets/images/kenji/Fall.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: '/assets/images/kenji/Attack1.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: '/assets/images/kenji/Take Hit.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Take Hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: '/assets/images/kenji/Death.png',
      imageSrcFlipped: '/assets/images/kenji-flipped/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    offsetFlipped: {
      x: 70,
      y: 50
    },
    width: 170,
    height: 50
  },
  defaultOrientation: ORIENTATION.LEFT
});

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowUp: { pressed: false }
};

// #endregion

// animation loop
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  shop.update();

  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    if (player.position.x > 0) {
      player.velocity.x = -MOVEMENT_SPEED;
      updateOrientation({ player: player, enemy: enemy });
      player.switchSprite(CHARACTER_STATE.RUN, player.isFlipped);
    }
  } else if (keys.d.pressed && player.lastKey === 'd') {
    if (player.position.x < canvas.width - player.width) {
      player.velocity.x = MOVEMENT_SPEED;
      updateOrientation({ player: player, enemy: enemy });
      player.switchSprite(CHARACTER_STATE.RUN, player.isFlipped);
    }
  } else {
    player.switchSprite(CHARACTER_STATE.IDLE, player.isFlipped);
  }
  // player jumping
  if (player.velocity.y < 0) {
    player.switchSprite(CHARACTER_STATE.JUMP, player.isFlipped);
  } else if (player.velocity.y > 0) {
    player.switchSprite(CHARACTER_STATE.FALL, player.isFlipped);
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    if (enemy.position.x > 0) {
      enemy.velocity.x = -MOVEMENT_SPEED;
      updateOrientation({ player: player, enemy: enemy });
      enemy.switchSprite(CHARACTER_STATE.RUN, enemy.isFlipped);
    }
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    if (enemy.position.x < canvas.width - enemy.width) {
      enemy.velocity.x = MOVEMENT_SPEED;
      updateOrientation({ player: player, enemy: enemy });
      enemy.switchSprite(CHARACTER_STATE.RUN, enemy.isFlipped);
    }
  } else {
    enemy.switchSprite(CHARACTER_STATE.IDLE, enemy.isFlipped);
  }
  // enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite(CHARACTER_STATE.JUMP, enemy.isFlipped);
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite(CHARACTER_STATE.FALL, enemy.isFlipped);
  }

  // #region Collision Detection

  // player
  if (player.isAttacking && player.framesCurrent === 4) {
    if (
      rectanglesCollide({
        rectangle1: player,
        rectangle2: enemy
      })
      ) {
      // hits
      player.isAttacking = false;
      enemy.takeHit(HEALTH_HIT_AMOUNT.NORMAL, () => {
        gsap.to('#enemyHealth', {
          width: `${enemy.health}%`
        });
      });
    } else {
      // misses
      player.isAttacking = false;
    }
  }

  // enemy
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    if (
      rectanglesCollide({
        rectangle1: enemy,
        rectangle2: player
      })
      ) {
      // hits
      enemy.isAttacking = false;
      player.takeHit(HEALTH_HIT_AMOUNT.NORMAL, () => {
        gsap.to('#playerHealth', {
          width: `${player.health}%`
        });
      });
    } else {
      // misses
      enemy.isAttacking = false;
    }
  }

  // #endregion

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

let timer = 100;
let timerId;

function decreaseTime() {
  timerId = setInterval(() => {
    if (timer > 0) {
      timer--;
      if (gameState !== GAME_STATE.RUNNING) {
        setGameState(GAME_STATE.RUNNING);
      }
    }
    document.querySelector('#timer').innerHTML = `${timer}`;

    // end game based on timer
    if (timer === 0) {
      determineWinner({ player, enemy, timerId });
    }
  }, 1000);
}

animate();
decreaseTime();
attachScreenWebSocket();

// #region Events

function startAction(event) {
  if (gameState === GAME_STATE.RUNNING) {
    switch(event.key) {
      // player
      case 'd':
        keys.d.pressed = true;
        player.lastKey = event.key;
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = event.key;
        break;
      case 'w':
        if (!player.isJumping) {
          player.velocity.y = -JUMP_SPEED;
        }
        break;
      case ' ':
        player.attack();
        break;
      // enemy
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = event.key;
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = event.key;
        break;
      case 'ArrowUp':
        if (!enemy.isJumping) {
          enemy.velocity.y = -JUMP_SPEED;
        }
        break;
      case 'ArrowDown':
        enemy.attack();
        break;
    }
  }
}

function stopAction(event) {
  switch(event.key) {
    // player
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 'w':
      keys.w.pressed = false;
    // enemy
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
    case 'ArrowUp':
      keys.ArrowUp.pressed = false;
      break;
  }
}

window.addEventListener('keydown', (event) => {
  startAction(event);
});

window.addEventListener('keyup', (event) => {
  stopAction(event);
});

// #endregion