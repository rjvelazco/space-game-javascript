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
