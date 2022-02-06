// DOCUMENT ELEMENTS
const $container = document.querySelector('.game');
const $scoreBoard = document.querySelector('#score');
const $gameOver = document.querySelector('.game-over');
const $congratulation = document.querySelector('.congratulations');
const $meteoriteStartPoints = document.querySelectorAll('.point');
const $btnStart = document.querySelector('#btn-start');
const $scorePoint = document.querySelector('#score-point');

// GAME SETTINGS
const { width: GAME_WIDTH, height: GAME_HEIGHT } = $container.getBoundingClientRect();
const METEORITE_MAX_SPEED = 200;

let METEORITE_TIME_APPEARS = 400;
let LAST_METEORITE_POSITION;
let setIntervalMeteorite;
let setIntervalScore;

// GAME STATE
const GAME_STATE = {
    lastTime: Date.now(),
    player: {
        x: 0,
        y: 0,
    },
    meteorites: [],
    currentScore: 0,
    isOver: false
}

// GAME UTILITIES
function getOffset(e) {
    const { x, y } = $container.getBoundingClientRect();

    const offsetX = e.pageX - x;
    const offsetY = e.pageY - y;

    return { offsetX, offsetY};
}

function setPosition({$element, x, y}) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setMeteoriteAppearsTimer () {
    clearInterval(setIntervalMeteorite)
    setIntervalMeteorite = setInterval(addMeteorite, METEORITE_TIME_APPEARS);
}

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

function isCollition(ob1, ob2) {
    return !(
        ((ob1.y + ob1.height) < (ob2.y)) ||
        (ob1.y > (ob2.y + ob2.height)) ||
        ((ob1.x + ob1.width) < ob2.x) ||
        (ob1.x > (ob2.x + ob2.width))
    )
}

function ajustDificulty() {
        
    switch(GAME_STATE.currentScore) {
        case 500: 
            METEORITE_TIME_APPEARS = 250;
            GAME_STATE.currentScore += 2;
            setMeteoriteAppearsTimer();
        break;
        case 750:
            METEORITE_TIME_APPEARS = 150;
            GAME_STATE.currentScore += 5;
            setMeteoriteAppearsTimer();
        break;
        case 1000: 
            onFinishGame( true );
        break;

        default: 
            GAME_STATE.currentScore++;
        break;
    }
}

function avoidSamePosition({position, lastPosition, max}) {
    if( position == lastPosition ) {
       return (position + 1) > max
            ? position - 1
            : position + 1;
    }

    return position;
}

function addMeteorite() {
    const max = $meteoriteStartPoints.length;
    const position = between(0, max - 1);
    const meteoritePosition = avoidSamePosition({ position, lastPosition: LAST_METEORITE_POSITION, max});
    LAST_METEORITE_POSITION = meteoritePosition;

    const { x, width } = $meteoriteStartPoints[meteoritePosition].getBoundingClientRect();
    const { x: containerX } = $container.getBoundingClientRect();
    const startAt = x - containerX + (width / 2);

    createMeteorite($container, startAt, -20);
}

function increaseScore() {
    $scorePoint.innerHTML = GAME_STATE.currentScore;
    ajustDificulty();
}

// CREATE GAME ELEMENTS
function createPlayer($container) {
    GAME_STATE.player.x = GAME_WIDTH / 2;
    GAME_STATE.player.y = GAME_HEIGHT - 50;

    const $player = document.createElement('img');
    $player.src = 'img/player-blue-1.png';
    $player.className = 'player';
    $container.appendChild($player);
    setPosition({ $element: $player, ...GAME_STATE.player });
}

function createMeteorite($container, x, y) {
    const $element = document.createElement('img');
    $element.src = 'img/meteorite.png';
    $element.className = 'meteorite';

    $container.appendChild($element);

    const meteorite = { x, y, $element };
    GAME_STATE.meteorites.push( meteorite );
    setPosition({$element, x, y});
}

// DESTROY GAME ELEMENTS
function destroyMeteorite($container, meteorite) {
    $container.removeChild( meteorite.$element );
    meteorite.isDead = true;
}

// UPDATERS
function update() {
    if (GAME_STATE.isOver) {
        return;
    }

    const currentTime = Date.now();
    const dt = (currentTime - GAME_STATE.lastTime) / 1000;
    
    updateMeteorites(dt, $container);
    GAME_STATE.lastTime = currentTime;
    // El método window.requestAnimationFrame informa al navegador
    // que quieres realizar una animación y solicita que el navegador
    // programe el repintado de la ventana para el próximo ciclo de animación
    window.requestAnimationFrame(update);
}

function updateMeteorites(dt, $container) {
    const meteorites = GAME_STATE.meteorites;
    meteorites.forEach( (meteorite) => {
        meteorite.y += dt * METEORITE_MAX_SPEED;
        setPosition({ ...meteorite });
        const ob1 = meteorite.$element.getBoundingClientRect();
        const ob2 = document.querySelector('.player').getBoundingClientRect();
        if (isCollition(ob1, ob2)) {
            onFinishGame( false )
        }

        if (meteorite.y > $container.getBoundingClientRect().bottom) {
            destroyMeteorite($container, meteorite);
        }

    });

    GAME_STATE.meteorites = GAME_STATE.meteorites.filter( (meteorite) => !meteorite.isDead );

}

function updatePlayerPosition(e) {
    GAME_STATE.player.x = e.offsetX;
    GAME_STATE.player.y = e.offsetY;

    const $player = document.querySelector('.player');
    setPosition({ $element: $player, ...GAME_STATE.player });
}

function updatePlayerPositionFromMovile(e) {
    const eventData = e.changedTouches[0];
    const { offsetX, offsetY } = getOffset(eventData);

    GAME_STATE.player.x = offsetX;
    GAME_STATE.player.y = offsetY;

    const $player = document.querySelector('.player');
    setPosition({ $element: $player, ...GAME_STATE.player });
}

// Events
function onWin() {
    const audio = new Audio('sounds/winner.mp3');
    audio.play();
    $congratulation.classList.remove('d-none');
}

function onLose() {
    const audio = new Audio('sounds/explotion-meteorite.mp3');
    audio.play();
    $gameOver.classList.remove('d-none');
}

function onFinishGame(isWinner = false) {
    GAME_STATE.isOver = true;
    const $player = document.querySelector('.player');
    $player.classList.add('hidden');
    clearInterval(setIntervalMeteorite);
    clearInterval(setIntervalScore);
    $container.classList.add('cursor-none');
    $container.removeEventListener('mousemove', updatePlayerPosition);
    $container.removeEventListener('touchmove', updatePlayerPositionFromMovile);
    if ( isWinner ) {
        onWin();
    } else {
        onLose();
    }
    
}


// INIT GAME
function init() {
    GAME_STATE.lastTime = Date.now();
    GAME_STATE.isOver = false;
    METEORITE_TIME_APPEARS = 400;

    $btnStart.classList.add('hidden');
    $scoreBoard.classList.remove('hidden');
    $gameOver.classList.add('d-none');
    $congratulation.classList.add('d-none');

    GAME_STATE.meteorites.forEach( (meteorite) => destroyMeteorite($container, meteorite));
    GAME_STATE.meteorites = [];
    const $player = document.querySelector('.player');
    
    if ($player) {
        $container.removeChild($player);
    }
    
    createPlayer($container);
    setIntervalMeteorite = setInterval(addMeteorite, METEORITE_TIME_APPEARS);
    setIntervalScore = setInterval(increaseScore, 100);
    GAME_STATE.currentScore = 0;
    $container.classList.add('cursor-none');
    $container.addEventListener('mousemove', updatePlayerPosition);
    $container.addEventListener('touchmove', updatePlayerPositionFromMovile);
    window.requestAnimationFrame(update);
}

$btnStart.addEventListener('click', () => init());

