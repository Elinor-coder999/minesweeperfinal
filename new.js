'use strict'
const MINE = '💣'
const FLAG = '🚩'
const SMILE = '😃'
const SAD = '🤯'
const WIN = '😎'

const gLevels = {
    BEGINNER: { SIZE: 4, MINES: 2 },
    MEDIUM: { SIZE: 8, MINES: 14 },
    EXPERT: { SIZE: 12, MINES: 32 }
}
var gLevel = gLevels.BEGINNER
var gBoard
var firstClick = true


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    gamesPlayed: 0,

}

function onInit() {
    if (gGame.lives <= 0) {
        gGame.lives = 3
        gGame.gamesPlayed = 0
    } else {
        gGame.isOn = true
    }
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount= 0
    startTimer()
    document.getElementById('lives').textContent = gGame.lives
    gBoard = buildBoard()
    renderBoard(gBoard)
    document.getElementById('smile').textContent = SMILE
    setMinesNegsCount(gBoard)
    firstClick = true


}

function buildBoard() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function setMines(firstI, firstJ) {
    var minesPlaced = 0
    const cells = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (i !== firstI || j !== firstJ) {
                cells.push({ i, j });
            }
        }
    }

    cells.sort(() => Math.random() - 0.5);

    while (minesPlaced < gLevel.MINES) {
        const { i, j } = cells.pop()
        if (!gBoard[i][j].isMine) {
            gBoard[i][j].isMine = true
            minesPlaced++;
        }
    }
    setMinesNegsCount()
}

function renderBoard() {
    const boardHTML = gBoard.map((row, i) =>
        `<tr>${row.map((cell, j) =>
            `<td onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;" 
                class="${cell.isShown ? 'shown' : ''} ${cell.isMarked ? 'marked' : ''}">
                ${cell.isShown ? (cell.isMine ? MINE : cell.minesAroundCount) : ''}
            </td>`
        ).join('')}</tr>`
    ).join('');
    document.querySelector('.board').innerHTML = `<table>${boardHTML}</table>`;
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) continue
            var mineCount = 0

            for (var x = i - 1; x <= i + 1; x++) {
                for (var y = j - 1; y <= j + 1; y++) {
                    if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE && gBoard[x][y].isMine) {
                        mineCount++
                    }
                }
            }
            gBoard[i][j].minesAroundCount = mineCount
        }
    }
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]

    if (!gGame.isOn || cell.isShown || cell.isMarked) return

    if (firstClick) {
        setMines(i, j)
        setMinesNegsCount()
        firstClick = false
    }
    cell.isShown = true
    gGame.shownCount++
    document.getElementById('shownCount').textContent = gGame.shownCount
    renderBoard()

    if (cell.isMine) {
        revealAllMines()
        document.getElementById('smile').textContent = SAD
        document.getElementById('lives').textContent = gGame.lives
        gGame.lives--
        if (gGame.lives <= 0) {
            stopTimer()
            document.getElementById('smile').textContent = SAD
            alert('Game Over! You have run out of lives.')
            gGame.isOn = false
            return
        }
        if (cell.minesAroundCount === 0) {
            expandShown(i, j)
        }
        checkGameOver()
    }
}
function expandShown(i, j) {
    for (var x = i - 1; x <= i + 1; x++) {
        for (var y = j - 1; y <= j + 1; y++) {
            if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE && !gBoard[x][y].isShown) {
                gBoard[x][y].isShown = true
                gGame.shownCount++
                document.getElementById('shownCount').textContent = gGame.shownCount
                renderBoard()
                if (gBoard[x][y].minesAroundCount === 0) {
                    expandShown(x, y)
                }
            }
        }
    }
}

function onCellMarked(elCell, i, j) {
    const cell = gBoard[i][j]
    if (!gGame.isOn || cell.isShown) return

    cell.isMarked = !cell.isMarked
    const boardHTML = gBoard.map((row, i) =>
        `<tr>${row.map((cell, j) =>
            `<td onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;"
                class="${cell.isShown ? 'shown' : ''} ${cell.isMine ? 'mine' : ''} ${cell.isMarked ? 'marked' : ''}"
                data-count="${cell.minesAroundCount}">
                ${cell.isMarked ? '🚩' : ''}
            </td>`
        ).join('')}</tr>`
    ).join('');
    document.querySelector('.board').innerHTML = `<table>${boardHTML}</table>`
    gGame.markedCount++
    document.getElementById('markedCount').textContent =  gGame.markedCount

    checkGameOver()
}

function checkGameOver() {
    if (!gGame.isOn) return

    var markedMinesCount = 0
    var revealedCellsCount = 0

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && cell.isMarked) {
                markedMinesCount++
            }
            if (cell.isShown) {
                revealedCellsCount++
            }
        }
    }

    if (markedMinesCount === gLevel.MINES &&
        revealedCellsCount === (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
        document.getElementById('smile').textContent = WIN
        stopTimer()
        alert('You Win!')
        gGame.isOn = false
    }
}
function revealAllMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true
            }
        }
    }
    renderBoard()
    stopTimer()
}

function onSmileyClick() {
    onInit()
    gGame.secsPassed = 0

}

function setLevel(level) {
    if (gLevels[level]) {
        gLevel = gLevels[level];
        onInit()
    }
}

function onLevelChange(level) {
    setLevel(level)
}

function startTimer() {
    gGame.timer = setInterval(() => {
        gGame.secsPassed++;
        document.getElementById('clock').textContent = gGame.secsPassed;
    }, 1000);
}

function stopTimer() {
    if (gGame.timer) {
        clearInterval(gGame.timer);
        gGame.timer = null;
    }
}

function resetTimer() {
    stopTimer()
    gGame.secsPassed = 0;
    document.getElementById('clock').textContent = gGame.secsPassed;
}
