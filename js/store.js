// CREATE A CUSTOM REDUCER
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
    const max = $meteoriteStartPoints.length - 1;
    const position = between(0, max);
    const meteoritePosition = avoidSamePosition({ position, lastPosition: LAST_METEORITE_POSITION, max});
    LAST_METEORITE_POSITION = meteoritePosition;

    const { x, width } = $meteoriteStartPoints[position].getBoundingClientRect();
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
