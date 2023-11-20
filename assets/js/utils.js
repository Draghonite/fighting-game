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
  let gameResults = document.querySelector('#gameResults');
  if (player.health === enemy.health) {
    gameResults.innerHTML = 'TIED!!';
  } else if (player.health > enemy.health) {
    gameResults.innerHTML = 'PLAYER 1 WINS!!';
  } else {
    gameResults.innerHTML = 'PLAYER 2 WINS!!';
  }
  gameResults.style.visibility = 'visible';
}