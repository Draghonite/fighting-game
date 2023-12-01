const PLAYER = {
  ONE: null,
  TWO: null
};

const ORIENTATION = {
  LEFT: 'left',
  RIGHT: 'right'
};

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
  INITIAL: 'Ready Up!',
  IDLE: 'idle',
  GAME_STARTING: 'Starting...',
  RUNNING: 'running',
  GAME_OVER: 'Game Over'
};

function routeActionEvent(request) {
  const EVENT_MAP = {
    [PLAYER.ONE]: {
      right: 'd',
      left: 'a',
      up: 'w',
      attack: ' '
    },
    [PLAYER.TWO]: {
      right: 'ArrowRight',
      left: 'ArrowLeft',
      up: 'ArrowUp',
      attack: 'ArrowDown'
    }
  };
  let action = request.action.split('=');
  console.log('[screen.routeActionEvent]: ', request, action);

  if (action[1]) {
    let event = { key: EVENT_MAP[request.ID][action[1]] };
    startAction(event);
    setTimeout(() => {
      stopAction(event);
    }, 250);
  } else {
    let event = { key: EVENT_MAP[request.ID][action[0]] };
    startAction(event);
    setTimeout(() => {
      stopAction(event);
    }, 250);
  }
}

function attachScreenWebSocket() {
  const ws = new WebSocket('ws://localhost:8082');

  ws.addEventListener('open', (client) => {
    console.log('[screen]: Connected!');
    ws.send(JSON.stringify({
      action: 'REG',
      role: 'Screen'
    }));
    console.log('[screen]: Registering as a Screen!');
  });

  ws.onmessage = (e) => {
    const message = JSON.parse(e.data); // compromising on performance over resilience (error-handling)
    if (!message) { return; }

    console.log('[screen]', message);

    // ensure that player 1 and player 2 are setup -- should be more robust
    if (message.action === 'REG_ACK' && message.role === 'Player') {
      if (!PLAYER.ONE && PLAYER.ONE !== message.ID) {
        PLAYER.ONE = message.ID;
        console.log('[screen]: Player 1 connected!');
      } else if (!PLAYER.TWO && PLAYER.TWO !== message.ID && PLAYER.ONE !== message.ID) {
        PLAYER.TWO = message.ID;
        console.log('[screen]: Player 2 connected!');
      }
    }

    // handle player ready
    if (message.action === 'ready') {
      if (PLAYER.ONE === message.ID) {
        document.querySelector('#player1Ready').click();
      } else if (PLAYER.TWO === message.ID) {
        document.querySelector('#player2Ready').click();
      }
    }

    console.log('[screen]: FROM-SERVER: ', message, PLAYER);

    if (PLAYER.ONE && PLAYER.TWO) {
      routeActionEvent(message);
    }
  };

  ws.onclose = (socket, e) => {
    // TODO: clean up clients list -- same client should be able to reload and reconnect
    console.log('[screen]: Screen disconnected.');
    // TODO: what happens if player exits mid-game -- if 1 player left, automatic winner?
  }
}

function setGameState(state, winner) {
  gameState = state;
  const gameResultsElement = document.querySelector('.game-results');
  const gameStateElement = gameResultsElement.querySelector('.game-state');
  const gameOutcomeElement = gameResultsElement.querySelector('#gameOutcome');
  const nextGameElement = gameResultsElement.querySelector('#nextGame');
  switch(state) {
    case GAME_STATE.GAME_STARTING:
      if (timer >= 2) {
        gameStateElement.innerHTML = GAME_STATE.GAME_STARTING;
      } else {
        gameStateElement.innerHTML = 'Fight!';
      }
      if (timer === 0) {
        gameResultsElement.style.visibility = 'hidden';
      }
      gameOutcomeElement.innerHTML = timer;
      gameOutcomeElement.style.visibility = 'visible';
      gameResultsElement.style.visibility = 'visible';
      break;
    case GAME_STATE.GAME_OVER:
      gameStateElement.innerHTML = GAME_STATE.GAME_OVER;
      gameOutcomeElement.innerHTML = winner;
      gameResultsElement.style.visibility = 'visible';
      nextGameElement.style.visibility = 'visible';
      break;
    case GAME_STATE.INITIAL:
      gameStateElement.innerHTML = GAME_STATE.INITIAL;
      gameStateElement.style.visibility = 'visible';
      gameOutcomeElement.style.visibility = 'hidden';
      gameResultsElement.style.visibility = 'hidden';
      nextGameElement.style.visibility = 'visible';
      break;
    case GAME_STATE.RUNNING:
      gameResultsElement.visibility = 'hidden';
      break;
  }
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

function updateOrientation({ player, enemy }) {
  if (player.position.x < enemy.position.x) {
    player.setOrientation(ORIENTATION.RIGHT);
    enemy.setOrientation(ORIENTATION.LEFT);
  } else {
    player.setOrientation(ORIENTATION.LEFT);
    enemy.setOrientation(ORIENTATION.RIGHT);
  }
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
        startGame();
      }
    }, 1000);
  }
}

setGameState(GAME_STATE.INITIAL);