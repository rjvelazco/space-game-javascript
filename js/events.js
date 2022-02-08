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
