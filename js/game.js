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

