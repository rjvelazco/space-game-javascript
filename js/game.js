// TODO: CREAGE A CLASS CALL "GAME"
// DOCUMENT ELEMENTS
const $container = document.querySelector('.game');
const $scoreBoard = document.querySelector('#score');
const $gameOver = document.querySelector('.game-over');
const $congratulation = document.querySelector('.congratulations');
const $meteoriteStartPoints = document.querySelectorAll('.point');
const $btnStart = document.querySelector('#btn-start');
const $scorePoint = document.querySelector('#score-point');
const $informationBox = document.querySelector('#information');
const $liveBox = document.querySelector('.live-box');
let $playerLifes = document.querySelectorAll('.live');

// GAME SETTINGS
const { width: GAME_WIDTH, height: GAME_HEIGHT } = $container.getBoundingClientRect();
const METEORITE_MAX_SPEED = 200;

let $player;
let METEORITE_TIME_APPEARS;
let LAST_METEORITE_POSITION;
let setIntervalMeteorite;
let setIntervalScore;

// GAME STATE
const GAME_STATE = {
    lastTime: Date.now(),
    player: {
        x: 0,
        y: 0,
        life: 3,
        invincibility: false
    },
    meteoriesSpeed: {
        level1: 1200,
        level2: 1000,
        level3: 800
    },
    meteorites: [],
    score: {
        current: 0,
        add: 1
    },
    isOver: false
}

// GAME UTILITIES
function setPosition({$element, x, y}) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setMeteoriteAppearsTimer () {
    clearInterval(setIntervalMeteorite)
    setIntervalMeteorite = setInterval(createMeteorite, METEORITE_TIME_APPEARS);
}

function addMeorite(x, y) {
    const $element = document.createElement('img');
    $element.src = 'img/meteorite.png';
    $element.className = 'meteorite';

    $container.appendChild($element);

    const meteorite = { x, y, $element };
    GAME_STATE.meteorites.push( meteorite );
    setPosition({$element, x, y});
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
        
    switch(GAME_STATE.score.current) {
        case 500: 
            METEORITE_TIME_APPEARS = GAME_STATE.meteoriesSpeed.level2;
            GAME_STATE.score.add = 2;
            setMeteoriteAppearsTimer();
        break;
        case 1000:
            METEORITE_TIME_APPEARS = GAME_STATE.meteoriesSpeed.level3;
            GAME_STATE.score.add = 5;
            setMeteoriteAppearsTimer();
        break;
        case 1500: 
            onFinishGame( true );
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

function increaseScore() {
    $scorePoint.innerHTML = GAME_STATE.score.current;
    GAME_STATE.score.current += GAME_STATE.score.add;
    ajustDificulty();
}

function addEvents() {
    $container.addEventListener('mousemove', updatePlayerPosition);
    $container.addEventListener('touchmove', updatePlayerPositionFromMobile);
}

function removeEvents() {
    $container.removeEventListener('mousemove', updatePlayerPosition);
    $container.removeEventListener('touchmove', updatePlayerPositionFromMobile);
}

function cleanScreenGameSpace() {
    $btnStart.classList.add('d-none');
    $congratulation.classList.add('d-none');
    $container.classList.add('cursor-none');
    $gameOver.classList.add('d-none');
    $informationBox.classList.add('d-none');
    $scoreBoard.classList.remove('hidden');
}

function resetGameState() {
    GAME_STATE.lastTime = Date.now();
    GAME_STATE.player.life = 3;
    GAME_STATE.isOver = false;
    GAME_STATE.meteorites.forEach( (meteorite) => destroyMeteorite($container, meteorite));
    GAME_STATE.meteorites = [];
    GAME_STATE.score.current = 0;
    GAME_STATE.score.add = 1;
    METEORITE_TIME_APPEARS = GAME_STATE.meteoriesSpeed.level1;
}

function cleanIntervals() {
    clearInterval(setIntervalMeteorite);
    clearInterval(setIntervalScore);
}

function playAudio(url = '') {

    if (!url.length) {
        return;
    }

    const audio = new Audio(url);
    audio.play()

}

function resetLives() {
    for(let i=0; i < 3; i++) {
        const img = document.createElement('img');
        img.src = "img/pixel-heart.png";
        img.alt = "Heart";
        img.classList.add('live');
        $liveBox.appendChild(img);
    };
    $playerLifes = document.querySelectorAll('.live');
}

function lostLive() {
    GAME_STATE.player.life--;
    GAME_STATE.player.invincibility = true;
    GAME_STATE.score.current = GAME_STATE.score.current - 100 < 0
        ? 0
        : GAME_STATE.score.current - 100;
    $liveBox.removeChild($playerLifes[GAME_STATE.player.life]);
    playAudio('sounds/damage.mp3');
    setTimeout(() => GAME_STATE.player.invincibility = false, 1000);
}

function getOffsetMobile({pageX, pageY}) {
    const { x, y } = $container.getBoundingClientRect();

    const offsetX = pageX - x;
    const offsetY = pageY - y;

    return { offsetX, offsetY};
}

function getPlayerOffset({offsetX, offsetY, pageX, pageY }) {

    const { height: pHeight, width: pWidth } = $player.getBoundingClientRect();
    const { left, right, bottom, top, height, width } = $container.getBoundingClientRect();

    const maxValueY = height - pHeight ;
    const maxValueX = width - (pWidth/2);
    const minValueX = (pWidth/2);

    const x = preventPlayerOverflow({
        value: pageX,
        min: left + (pWidth /2),
        max: right - (pWidth / 2),
        maxValue: maxValueX,
        minValue: minValueX,
    }) || offsetX;
    const y  = preventPlayerOverflow({
        value: pageY,
        min: top,
        max: bottom - pHeight,
        maxValue: maxValueY,
        minValue: 1
    }) || offsetY;

    return { x, y };

}

function preventPlayerOverflow({ value, min, max, maxValue, minValue }) {
    if ( value < min) {
        return minValue;
    } else if( value > max) {
        return maxValue;        
    }
}

// CREATE GAME ELEMENTS
function createPlayer($container) {

    GAME_STATE.player.x = GAME_WIDTH / 2;
    GAME_STATE.player.y = GAME_HEIGHT - 50;

    const $newPlayer = document.createElement('img');
    $newPlayer.src = 'img/player-blue-1.png';
    $newPlayer.className = 'player';
    $container.appendChild($newPlayer);

    $player = $newPlayer;
    setPosition({ $element: $player, ...GAME_STATE.player });
}

function createMeteorite() {
    const max = $meteoriteStartPoints.length;
    const position = between(0, max - 1);
    const meteoritePosition = avoidSamePosition({ position, lastPosition: LAST_METEORITE_POSITION, max});
    LAST_METEORITE_POSITION = meteoritePosition;

    const { x, width } = $meteoriteStartPoints[meteoritePosition].getBoundingClientRect();
    const { x: containerX } = $container.getBoundingClientRect();
    const startAt = x - containerX - (width / 2);

    addMeorite(startAt, -20);
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
        const ob2 = $player.getBoundingClientRect();
        if (isCollition(ob1, ob2)) {
            if(GAME_STATE.player.life && !GAME_STATE.player.invincibility) {
                lostLive();
            } else if(GAME_STATE.player.life === 0) {
                onFinishGame(false);
            }
        }

        if (meteorite.y > $container.getBoundingClientRect().bottom) {
            destroyMeteorite($container, meteorite);
        }

    });

    GAME_STATE.meteorites = GAME_STATE.meteorites.filter( (meteorite) => !meteorite.isDead );

}

function updatePlayerPosition(e) {
    const { x, y } = getPlayerOffset(e);

    GAME_STATE.player.x = x;
    GAME_STATE.player.y = y;

    setPosition({ $element: $player, ...GAME_STATE.player });
}

function updatePlayerPositionFromMobile(e) {
    const eventData = e.changedTouches[0];
    const { offsetX, offsetY } = getOffsetMobile(eventData);
    const { x, y } = getPlayerOffset({ offsetX, offsetY, pageX: eventData.pageX, pageY: eventData.pageY })

    GAME_STATE.player.x = x;
    GAME_STATE.player.y = y;

    setPosition({ $element: $player, ...GAME_STATE.player });
}

// Events
function onWin() {
    playAudio('sounds/winner.mp3');
    // Remove lives
    $liveBox.innerHTML = '';
    $congratulation.classList.remove('d-none');
}

function onLose() {
    playAudio('sounds/explotion-meteorite.mp3');
    $gameOver.classList.remove('d-none');
}

function onFinishGame(isWinner = false) {
    GAME_STATE.isOver = true;
    $player.classList.add('hidden');

    $informationBox.classList.remove('d-none');
    $container.classList.remove('cursor-none');

    cleanIntervals();
    removeEvents();

    if ( isWinner ) {
        onWin();
    } else {
        onLose();
    }
    
}

// INIT GAME
function init() {
    addEvents();
    resetGameState();
    cleanScreenGameSpace();
    resetLives();

    if ($player) $container.removeChild($player);
    createPlayer($container);

    setIntervalMeteorite = setInterval(createMeteorite, METEORITE_TIME_APPEARS);
    setIntervalScore = setInterval(increaseScore, 100);
    window.requestAnimationFrame(update);
}

$btnStart.addEventListener('click', () => init());

