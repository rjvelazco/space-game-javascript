const $btnStart = document.querySelector('#btn-start');
const $scoreBoard = document.querySelector('#score');



function init() {
    $btnStart.classList.add('hidden');
    $scoreBoard.classList.remove('hidden');
}

$btnStart.addEventListener('click', () => init());
