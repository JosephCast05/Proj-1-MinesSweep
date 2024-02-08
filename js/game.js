'use strict'

const MARK = '☠️'
const BOMB = '💣'
const elModalWin = document.querySelector('.WinModal')
const elModalLost = document.querySelector('.LostModal')
const elBtn = document.querySelector('.reset')

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

function onInitGame(level) {
    elModalWin.style.display = 'none'
    elModalLost.style.display = 'none'
    elBtn.innerText = '😊'

    switch (level) {
        case 'easy':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break
        case 'medium':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            break
        case 'hard':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            break;
        default:
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break
    }

    gBoard = createBoard()
    gGame.isOn = true
    gGame.lives = 3
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    updateCounter('minesCount', gLevel.MINES)
    updateCounter('scoreCount', 0)
    updateCounter('flagsCount', 0)
    updateCounter('timeCount', 0)
    updateCounter('livesCount', gGame.lives)
    clearInterval(gGame.timerInterval)
    renderBoard()
}

function updateCounter(className, value) {
    const elements = document.getElementsByClassName(className)
    if (className === 'livesCount') {
        var hearts = ''

        for (var i = 0; i < gGame.lives; i++) {
            hearts += '❤️'
        }

        for (var i = gGame.lives; i < 3; i++) {
            hearts += '💔'
        }

        for (var i = 0; i < elements.length; i++) {
            elements[i].innerHTML = hearts
        }
    } else {
        for (var i = 0; i < elements.length; i++) {
            elements[i].innerText = value
        }
    }
}

function createBoard() {
    const board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    //BOMB CAN BE ALSO IN FIRST CLICKED CELL

    /*for (var i = 0; i < gLevel.MINES; i++) {
        var randomRow = Math.floor(Math.random() * gLevel.SIZE)
        var randomCol = Math.floor(Math.random() * gLevel.SIZE)
    
        while (board[randomRow][randomCol].isMine) {
            randomRow = Math.floor(Math.random() * gLevel.SIZE)
            randomCol = Math.floor(Math.random() * gLevel.SIZE)
        }
    
        board[randomRow][randomCol].isMine = true
    }
    
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
    */
    return board
}

//A MINE CANNOT BE IN FIRST CLICKED CELL
function placeMines(clickedRow, clickedCol) {

    var minesPlaced = 0;
    while (minesPlaced < gLevel.MINES) {
        var randomRow = Math.floor(Math.random() * gLevel.SIZE)
        var randomCol = Math.floor(Math.random() * gLevel.SIZE)

        if (!gBoard[randomRow][randomCol].isMine && !(randomRow === clickedRow && randomCol === clickedCol)) {
            gBoard[randomRow][randomCol].isMine = true
            minesPlaced++
        }
    }

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j);
        }
    }
}

function renderBoard() {
    var strHTML = ''

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="board-row" >\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]

            var className = ''
            if (cell.minesAroundCount === 0 && !cell.isMine && cell.isShown) {
                className += 'safe'
            }
            if (cell.minesAroundCount > 0 && !cell.isMine && cell.isShown) {
                switch (cell.minesAroundCount) {
                    case 1:
                        className += 'touchingOne'
                        break
                    case 2:
                        className += 'touchingTwo'
                        break
                    case 3:
                        className += 'touchingThree'
                        break
                    case 4:
                        className += 'touchingFour'
                        break
                    case 5:
                        className += 'touchingFive'
                        break
                    case 6:
                        className += 'touchingSix'
                        break
                    case 7:
                        className += 'touchingSeven'
                        break
                    case 8:
                        className += 'touchingEight'
                        break
                }

            } else if (!cell.isShown) {
                className += ' covered'
            }
            if (cell.isMarked && !cell.isShown) {
                className += ' marked'

            }
            if (cell.isMine && cell.isShown) {
                className += ' mine'
            }
            const title = `square: ${i}, ${j}`

            strHTML += `\t<td data-i="${i}" data-j="${j}" title="${title}" class="cell ${className}" 
                                onclick="onCellClicked(this, ${i}, ${j})"
                                oncontextmenu="onCellMarked(event, this, ${i}, ${j}); return false;">
                                ${cell.isShown && !cell.isMine && cell.minesAroundCount > 0 ? cell.minesAroundCount : ''}
                                ${cell.isShown && cell.isMine ? BOMB : ''}
                                ${cell.isMarked && !cell.isShown ? MARK : ''}
                            </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elGame = document.querySelector('.game')
    elGame.innerHTML = strHTML
}

//UPDATES NEIGHBOORS MINES COUNT
function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            const currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function onCellClicked(elCell, i, j) {
    const cell = gBoard[i][j]

    if (!gGame.isOn || cell.isShown || cell.isMarked) {
        return
    }
    if (gGame.shownCount === 0) {
        placeMines(i, j)
        startTimer()
    }
    if (cell.isMine) {
        handleMineClick(elCell, i, j);
    } else {
        cell.isShown = true;
        gGame.shownCount++;

        if (cell.minesAroundCount === 0) {
            showNegs(i, j);
        }

        renderBoard();
    }

    updateCounter('scoreCount', gGame.shownCount);
    checkGameOver();
}

function handleMineClick(elCell, i, j) {
    gGame.lives--;
    updateCounter('livesCount', gGame.lives);

    if (gGame.lives > 0) {
        elCell.innerText = `💣here\n${gGame.lives}❤️left `
        setTimeout(() => {
            elCell.innerText = originalContent
            renderBoard()
        }, 1000);
    } else {
        elBtn.innerText = '🤯';
        showAllCells();
        elModalLost.style.display = 'block';
        gGame.isOn = false;
    }
}

function startTimer() {
    gGame.timerInterval = setInterval(function () {
        if (gGame.isOn) {
            gGame.secsPassed++
            updateCounter('timeCount', gGame.secsPassed)
        }else{
            clearInterval(gGame.timerInterval)
        }
        }, 1000)

}

//OPENS NEIGHBOORS CELL WHICH ARE NOT MINES AND RECURSE UNTIL FINDS THE FIRST CELL WHICH TOUCH A MINE
function showNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) {
                continue
            }
            const neighborCell = gBoard[i][j]

            if (!neighborCell.isMine && !neighborCell.isShown && !neighborCell.isMarked) {
                neighborCell.isShown = true
                gGame.shownCount++

                if (neighborCell.minesAroundCount && !neighborCell.isMine > 0) {
                    const elNeighborCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                    elNeighborCell.innerText = neighborCell.minesAroundCount;
                } else {
                    showNegs(i, j)
                }
            }
        }
    }
}

//MARKS THE CELL WHICH THE USER BELIEVES IS HIDDEN THE MINE
function onCellMarked(event, elCell, i, j) {
    const cell = gBoard[i][j]

    cell.isMarked = !cell.isMarked
    elCell.classList.toggle('marked', cell.isMarked)
    gGame.markedCount += cell.isMarked ? 1 : -1
    renderBoard()
    updateCounter('flagsCount', gGame.markedCount)
    checkGameOver()
}

// ONLY FOR LOST GAMES WANTS TO SHOW THE USER THE SOLUTION
function showAllCells() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].isShown = true
        }
    }
    renderBoard()
}

function checkGameOver() {
    const totalCells = gLevel.SIZE * gLevel.SIZE
    const totalSafeCells = totalCells - gLevel.MINES

    if (gGame.shownCount === totalSafeCells && gGame.markedCount === gLevel.MINES) {
        elBtn.innerText = '😎'
        elModalWin.style.display = 'block'
        gGame.isOn = false
    }
}
