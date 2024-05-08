'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const HINT = '💡'
const SAFE = '🟩'

var gBoard = []
var gLevel = {}

const LEVEL = {
    beginner: { SIZE: 4, MINES: 2 },
    medium: { SIZE: 8, MINES: 14 },
    expert: { SIZE: 12, MINES: 32 }
}

var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, life: 3, safe: 3, safe: 3, moveHistory: []}

var gTimerInterval
var gHintsInterval

function initGame(level = 'beginner') {
    document.querySelector('.game-over-modal').innerHTML = `<button class="restart-btn" onclick="initGame('${level}')">😃</button>`
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.life = 3
    gGame.hint = 3
    gGame.safe = 3
    gGame.moveHistory = []
    gLevel = LEVEL[level]
    gBoard = createBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    document.querySelector('.timer').innerText = "Time: " + gGame.secsPassed + " secs"
    stopTimer()
    gGame.isOn = true
}

function createBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        }
    }
    // board[1][1].isMine = true
    // board[2][2].isMine = true
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var cellContent = ''
            if (cell.isShown) {
                if (cell.isMine) cellContent = MINE
                else cellContent = cell.minesAroundCount
            } else if (cell.isMarked) {
                cellContent = FLAG
            }

            var cellClass = ''
            if (cell.isShown) cellClass = 'shown'
            else if (cell.isMarked) cellClass = 'marked'

            strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="onHint(event, ${i}, ${j})">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }

    updateLife(gGame.life)
    updateSafe(gGame.safe)
    updateHint(gGame.hint)
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

/*
This function is called when a cell (td) is clicked
It receives the cell element (td) and the i and j indexes of the cell in the board matrix
*/
function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]

    if (!gGame.isOn || cell.isMarked || cell.isShown) {
        stopTimer()
        return
    }

    if (gGame.shownCount === 0) {
        startTimer()
        gBoard = placeMinesRandomly(gBoard, i, j)
    }

    if (cell.isMine) {
        elCell.classList.add('mine')
        elCell.innerHTML = MINE
        gGame.life--
        updateLife(gGame.life)

        if (gGame.life === 0) {
            gameOver()
        }
    } else {
        if (cell.minesAroundCount === 1) {
            elCell.style.color = 'blue';
        } else if (cell.minesAroundCount === 2) {
            elCell.style.color = 'green';
        } else if (cell.minesAroundCount >= 3) {
            elCell.style.color = 'red';
        }
        expandShown(gBoard, i, j)        
    }
}

function placeMinesRandomly(board, firstClickRow, firstClickCol) {
    const totalCells = gLevel.SIZE ** 2
    const mineIndices = []

    while (mineIndices.length < gLevel.MINES) {
        const randomIndex = getRandomIntInclusive(0, totalCells - 1)
        const row = Math.floor(randomIndex / gLevel.SIZE)
        const col = randomIndex % gLevel.SIZE

        if (
            !mineIndices.includes(randomIndex) &&
            (row !== firstClickRow || col !== firstClickCol)
        ) {
            mineIndices.push(randomIndex)
        }
    }

    const newBoard = copyMat(board)

    for (var i = 0; i < mineIndices.length; i++) {
        const row = Math.floor(mineIndices[i] / gLevel.SIZE)
        const col = mineIndices[i] % gLevel.SIZE
        newBoard[row][col].isMine = true
    }

    setMinesNegsCount(newBoard)
    return newBoard
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
}

function countNeighbors(rowIdx, colIdx, board) {
    var minesAroundCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) {
                minesAroundCount++
            }
        }
    }

    return minesAroundCount
}


// function that expands the shown cells when a cell with no mines around it is clicked
function expandShown(board, rowIdx, colIdx) {
    var cell = board[rowIdx][colIdx]
    if (cell.isShown) return

    cell.isShown = true
    gGame.shownCount++
    var elCell = document.querySelector(`.cell[onclick="cellClicked(this, ${rowIdx}, ${colIdx})"]`)
    elCell.classList.add('shown')

    if (cell.minesAroundCount === 0) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= board.length) continue

            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j >= board[i].length) continue
                if (i === rowIdx && j === colIdx) continue

                expandShown(board, i, j)
            }
        }
    } else {
        elCell.innerHTML = cell.minesAroundCount
    }
    gameWinner()
}

// function that checks if the game is over (win/lose)
function onHint(ev, i, j) {
    ev.preventDefault()

    var cell = gBoard[i][j]
    var elCell = document.querySelector(`.cell[onclick="cellClicked(this, ${i}, ${j})"]`)
    if (!cell.isShown) {
        if (!cell.isMarked) {
            cell.isMarked = true
            elCell.innerHTML = FLAG
            elCell.classList.add('marked')
            elCell.style.backgroundColor = 'yellow'
            if (cell.isMine) {
                gGame.markedCount++
            }
        } else {
            cell.isMarked = false
            elCell.innerHTML = ''
            elCell.classList.remove('marked')
            elCell.style.backgroundColor = ''
            if (cell.isMine) {
                gGame.markedCount--
            }
        }
        gameWinner()
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell[onclick="cellClicked(this, ${i}, ${j})"]`)
                elCell.classList.add('mine')
                elCell.innerHTML = MINE
            }
        }
    }
}

function useSafe() {
    if (gGame.safe === 0 || !gGame.isOn) return

    var safeCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine && !cell.isMarked) {
                safeCells.push({ i, j })
            }
        }
    }

    var randomCell = safeCells[getRandomIntInclusive(0, safeCells.length - 1)]
    var elCell = document.querySelector(`.cell[onclick="cellClicked(this, ${randomCell.i}, ${randomCell.j})"]`)
    
    elCell.classList.add('safe-highlight')

    setTimeout(() => {
        elCell.classList.remove('safe-highlight')
    }, 3000)

    gGame.safe--
    updateSafe(gGame.safe)
}

function gameOver() {
    const elGameOver = document.querySelector('.game-over-modal')
    stopTimer()
    revealMines()
    elGameOver.innerHTML = `<button class="restart-btn" onclick="initGame('${gLevel === LEVEL.beginner ? 'beginner' : gLevel === LEVEL.medium ? 'medium' : 'expert'}')">🤯</button>`
    gGame.isOn = false
}

function gameWinner() {
    var correctFlags = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMarked && cell.isMine) correctFlags++
        }
    }

    if (correctFlags === gLevel.MINES) {
        const elGameOver = document.querySelector('.game-over-modal')
        stopTimer()
        revealMines()
        elGameOver.innerHTML = `<button class="restart-btn" onclick="initGame('${gLevel === LEVEL.beginner ? 'beginner' : gLevel === LEVEL.medium ? 'medium' : 'expert'}')">😎</button>`
        gGame.isOn = false

    }
}

function startTimer() {
    gTimerInterval = setInterval(function () {
        gGame.secsPassed++
        document.querySelector('.timer').innerText = "Time:" + gGame.secsPassed + "secs"
    }, 1000)
}

function stopTimer() {
    clearInterval(gTimerInterval)
}