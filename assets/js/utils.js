const CHARACTER_STATE = {
  IDLE: 'idle',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  ATTACK_1: 'attack1',
  TAKE_HIT: 'takeHit',
  DEATH: 'death'
};

const HEALTH_HIT_AMOUNT = {
  NORMAL: 20,
  DOUBLE: 40,
  FATALITY: 100
};

const GAME_STATE = {
  GAME_STARTING: 'Starting...',
  GAME_OVER: 'Game Over'
};

function setGameState(state, winner) {
  const gameResults = document.querySelector('.game-results');
  const gameState = gameResults.querySelector('.game-state');
  const gameOutcome = gameResults.querySelector('#gameOutcome');
  switch(state) {
    case GAME_STATE.GAME_STARTING:
      gameState.innerHTML = GAME_STATE.GAME_STARTING;
      gameOutcome.innerHTML = timer;
      break;
    case GAME_STATE.GAME_OVER:
      gameState.innerHTML = GAME_STATE.GAME_OVER;
      gameOutcome.innerHTML = winner;
      break;
  }
  gameResults.style.visibility = 'visible';
}

function rectanglesCollide({ rectangle1, rectangle2 }) {
  return (
    rectangle1.isAttacking &&
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

function determineWinner({ player, enemy, timerId }) {
  clearInterval(timerId);
  let winner = 'TIED!!';
  if (player.health === enemy.health) {
    winner = 'TIED!!';
  } else if (player.health > enemy.health) {
    winner = 'PLAYER 1 WINS!!';
  } else {
    winner = 'PLAYER 2 WINS!!';
  }
  setGameState(GAME_STATE.GAME_OVER, winner);
}

function setPlayerReady(ele, playerNumber) {
  ele.innerHTML = 'Ready';
  switch(playerNumber) {
    case 1:
      player.isReady = true;
      break;
    case 2:
      enemy.isReady = true;
      break;
  }
  if (player.isReady && enemy.isReady) {
    timer = 5;
    setInterval(() => {
      timer--;
      setGameState(GAME_STATE.GAME_STARTING);
      if (timer <= 0) {
        location.reload();
      }
    }, 1000);
  }
}