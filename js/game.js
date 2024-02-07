var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInitGame() {
    gBoard = createBoard()
    gLevel
    gGame
    renderBoard()
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
    for (var i = 0; i < gLevel.MINES; i++) {
        var randomRow = Math.floor(Math.random() * gLevel.SIZE);
        var randomCol = Math.floor(Math.random() * gLevel.SIZE);

        while (board[randomRow][randomCol].isMine) {
            randomRow = Math.floor(Math.random() * gLevel.SIZE);
            randomCol = Math.floor(Math.random() * gLevel.SIZE);
        }

        board[randomRow][randomCol].isMine = true;
    }

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j);
        }
    }

    console.table(board)
    console.log('examined cell row3-col3', board[2][2]);
    return board
}

function renderBoard() {
    var strHTML = ''

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="board-row" >\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]

            // For a cell of type SEAT add seat class
            var className = ''
            if (!cell.isMine && cell.isShown && cell.minesAroundCount === 0) {
                className += 'safe'
            }
            if (!cell.isMine && cell.isShown && cell.minesAroundCount === 1) {
                className += 'touchingOne'
            }
            if (!cell.isMine && cell.isShown && cell.minesAroundCount === 2) {
                className += 'touchingTwo'
            }
            if (!cell.isMine && cell.isShown && cell.minesAroundCount === 3) {
                className += 'touchingThree'
            }
            if (cell.isMine && cell.isShown) {
                className += ' mine'
            }
            if (!cell.isShown) {
                className += ' covered'
            }
            // Add a seat title
            const title = `square: ${i}, ${j}`

            strHTML += `\t<td data-i="${i}" data-j="${j}" title="${title}" class="cell ${className}" 
                            onclick="onCellClicked(this, ${i}, ${j})" >
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }

    const elSeats = document.querySelector('.game')
    elSeats.innerHTML = strHTML
}

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
    if (cell.isShown || cell.isMarked) {
        return;
    }
    cell.isShown = true
    if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount;
    } else {
        showNegs(i, j)
    }

    renderBoard()
}

function showNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) {
                continue;
            }
            const neighborCell = gBoard[i][j];
            console.log(neighborCell);

            if (!neighborCell.isMine && !neighborCell.isShown) {
                neighborCell.isShown = true;

                if (neighborCell.minesAroundCount > 0) {
                    const elNeighborCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                    elNeighborCell.innerText = neighborCell.minesAroundCount;
                } else {
                    showNegs(i, j);
                }
            }
        }
    }
}