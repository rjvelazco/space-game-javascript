// DOCUMENT ELEMENTS
const $container = document.querySelector('.game');
const $scoreBoard = document.querySelector('#score');
const $gameOver = document.querySelector('.game-over');
const $meteoriteStartPoints = document.querySelectorAll('.point');
const $btnStart = document.querySelector('#btn-start');
const $btnRestart = document.querySelector('#btn-restart');

// GAME SETTINGS
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const METEORITE_MAX_SPEED = 200;

// GAME STATE
const GAME_STATE = {
    lastTime: Date.now(),
    player: {
        x: 0,
        y: 0,
    },
    meteorites: [],
    isOver: false
}

// GAME UTILITIES
function setPosition({$element, x, y}) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
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

function addMeteorite() {
    const meteoritePosition = between(0, $meteoriteStartPoints.length);
    const { x, width } = $meteoriteStartPoints[meteoritePosition].getBoundingClientRect();
    const { x: containerX } = $container.getBoundingClientRect();
    const startAt = x - containerX + (width / 2);
    createMeteorite($container, startAt, -20);
}

let setIntervalMeteorite;

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
    // updatePlayer(dt, $container);
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
            onLose();
        }

        if (meteorite.y > $container.getBoundingClientRect().bottom) {
            destroyMeteorite($container, meteorite);
        }

    });

    GAME_STATE.meteorites = GAME_STATE.meteorites.filter( (meteorite) => !meteorite.isDead );

}

function updatePlayerPosition($event) {
    GAME_STATE.player.x = $event.offsetX;
    GAME_STATE.player.y = $event.offsetY;
    const $player = document.querySelector('.player');
    setPosition({ $element: $player, ...GAME_STATE.player });
}

// Events
function onLose() {
    GAME_STATE.isOver = true;
    const audio = new Audio('sounds/Explosion.mp3');
    audio.play();
    
    const $player = document.querySelector('.player');

    $player.classList.add('hidden');
    $gameOver.classList.remove('d-none');
    clearInterval(setIntervalMeteorite);
    $container.removeEventListener('mousemove', updatePlayerPosition);
}


// INIT GAME
function init() {
    GAME_STATE.lastTime = Date.now();
    GAME_STATE.isOver = false;

    $btnStart.classList.add('hidden');
    $scoreBoard.classList.remove('hidden');
    $gameOver.classList.add('d-none');

    GAME_STATE.meteorites.forEach( (meteorite) => destroyMeteorite($container, meteorite));
    GAME_STATE.meteorites = [];
    const $player = document.querySelector('.player');
    
    if ($player) {
        $container.removeChild($player);
    }
    
    createPlayer($container);
    setIntervalMeteorite = setInterval(addMeteorite, 1000);
    $container.addEventListener('mousemove', updatePlayerPosition);
    window.requestAnimationFrame(update);
}

$btnStart.addEventListener('click', () => init());
$btnRestart.addEventListener('click', () => init());

