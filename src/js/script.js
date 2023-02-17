import '../styles/style.scss';

const BOARD_DOM = document.getElementById('app');

const ROW = 8;
const COL = 8;
let SQUARE_SIZE;
let BOARD_BORDER;
if (window.matchMedia('(min-width: 500px)').matches) {
  SQUARE_SIZE = 50;
  BOARD_BORDER = 10;
} else {
  SQUARE_SIZE = 37.5;
  BOARD_BORDER = 7.5;
}

const BLACK = 'b';
const WHITE = 'w';

const PAWN = 'pawn';
const ROOK = 'rook';
const KNIGHT = 'knight';
const BISHOP = 'bishop';
const QUEEN = 'queen';
const KING = 'king';

const B_PAWN = '&#9823;';
const W_PAWN = '&#9817;';
const B_ROOK = '&#9820;';
const W_ROOK = '&#9814;';
const B_KNIGHT = '&#9822;';
const W_KNIGHT = '&#9816;';
const B_BISHOP = '&#9821;';
const W_BISHOP = '&#9815;';
const B_QUEEN = '&#9819;';
const W_QUEEN = '&#9813;';
const B_KING = '&#9818;';
const W_KING = '&#9812;';

let isMoving = null;
const turnDom = document.getElementById('turn');

function createBoard(row, col) {
  const arr = [];
  for (let i = 0; i < row; i++) {
    const rowArr = [];
    for (let j = 0; j < col; j++) {
      let value = true;
      if (i % 2 === 0) value = !value;
      if (j % 2 === 0) value = !value;
      rowArr.push({ piece: null, background: value });
    }
    arr.push(rowArr);
  }
  return arr;
}

function renderBoard() {
  const boardHTML = this.board.reduce(function (acc, item, index) {
    let row = '';
    item.forEach(function (element, idx) {
      let pieceName = '';
      let color = '';
      let id = '';
      let player = '';
      const classValue = element.background ? 'grey' : 'white';

      if (element.piece) {
        pieceName = element.piece.name;
        color = element.piece.color;
        id = `data-piece=${element.piece.id}`;
        player = `data-player=${color}`;
      }

      row += `<div data-x=${idx} class="${classValue}">${buildPiece(pieceName, color, id, player)}</div>`;
    });
    return acc += `<div data-y=${index} class="row">${row}</div>`;
  }, '');
  BOARD_DOM.innerHTML = boardHTML;
}

function buildPiece(name, color, id, player) {
  let value = '';
  if (!name) return value;

  if (name === PAWN) value = color === BLACK ? B_PAWN : W_PAWN;
  if (name === ROOK) value = color === BLACK ? B_ROOK : W_ROOK;
  if (name === KNIGHT) value = color === BLACK ? B_KNIGHT : W_KNIGHT;
  if (name === BISHOP) value = color === BLACK ? B_BISHOP : W_BISHOP;
  if (name === QUEEN) value = color === BLACK ? B_QUEEN : W_QUEEN;
  if (name === KING) value = color === BLACK ? B_KING : W_KING;

  return `<div ${id} ${player} class="game-piece">${value}</div>`;
}

function GamePiece(x, y, name, color, count) {
  this.name = name;
  this.color = color;
  this.x = x;
  this.y = y;
  this.id = name + count + color;
  this.move();
  game.pieces[this.id] = this;
}

GamePiece.prototype.move = function () {
  game.board[this.y][this.x].piece = this;
  game.render();
};

GamePiece.prototype.update = function (x, y) {
  if (isMoveAllowed(this, x, y)) {
    this.x = x;
    this.y = y;
    this.move();
    game.render();
    game.updateTurn();
  } else {
    this.goBack();
  }
};

GamePiece.prototype.goBack = function () {
  this.move();
};

function isMoveAllowed(obj, x, y) {
  let isAllowed = false;

  if (obj.name === PAWN) isAllowed = checkPawnRules(obj, x, y);
  if (obj.name === ROOK) isAllowed = checkRookRules(obj, x, y);
  if (obj.name === KNIGHT) isAllowed = checkKnightRules(obj, x, y);
  if (obj.name === BISHOP) isAllowed = checkBishopRules(obj, x, y);
  if (obj.name === QUEEN) isAllowed = checkQueenRules(obj, x, y);
  if (obj.name === KING) isAllowed = checkKingRules(obj, x, y);

  return isAllowed;
}

function checkPawnRules(obj, x, y) {
  const initialY = obj.color === BLACK ? 1 : 6;
  const collisionValue = checkCollision(x, y);
  let result = true;

  if (obj.x !== x) result = false;
  if (obj.x === x && collisionValue && collisionValue.color !== obj.color) result = false;

  if (obj.color === WHITE) {
    if (obj.y < y || y !== obj.y - 1) {
      result = false;
    }
    if (initialY === obj.y && y === obj.y - 2 && obj.x === x) {
      result = true;
    }
  }

  if (obj.color === BLACK) {
    if (obj.y > y || y !== obj.y + 1) {
      result = false;
    }
    if (initialY === obj.y && y === obj.y + 2 && obj.x === x) {
      result = true;
    }
  }

  if (collisionValue && collisionValue.color !== obj.color) {
    if (x === obj.x - 1 || x === obj.x + 1) {
      result = true;
    }
  }

  return result;
}

function checkRookRules(obj, x, y) {
  const dest = { x, y };
  const collisionValue = checkCollision(x, y);
  const ownColor = obj.color;

  if (x === obj.x && y === obj.y) return false;
  if (x !== obj.x && y !== obj.y) return false;

  const letter = obj.x === x ? 'y' : 'x';

  const min = Math.min(obj[letter], dest[letter]) + 1;
  const max = Math.max(obj[letter], dest[letter]) - 1;

  for (let i = min; i <= max; i++) {
    if (letter === 'y') {
      if (checkCollision(x, i)) return false;
    } else if (checkCollision(i, y)) return false;
  }

  if (collisionValue && collisionValue.color !== ownColor || !collisionValue) return true;

  return false;
}

function checkKnightRules(initial, x, y) {
  const collisionValue = checkCollision(x, y);
  const ownColor = initial.color;

  if (collisionValue && collisionValue.color !== ownColor || !collisionValue) {
    if ((y === initial.y + 2 && x === initial.x + 1)
         || (y === initial.y + 2 && x === initial.x - 1)
         || (y === initial.y - 2 && x === initial.x + 1)
         || (y === initial.y - 2 && x === initial.x - 1)) return true;

    if ((x === initial.x + 2 && y === initial.y + 1)
         || (x === initial.x + 2 && y === initial.y - 1)
         || (x === initial.x - 2 && y === initial.y + 1)
         || (x === initial.x - 2 && y === initial.y - 1)) return true;
  }
  return false;
}

function checkBishopRules(initial, x, y) {
  const collisionValue = checkCollision(x, y);

  const xDiff = Math.abs(initial.x - x);
  const yDiff = Math.abs(initial.y - y);

  if ((xDiff === yDiff) && !collisionValue
       || (collisionValue && collisionValue.color !== initial.color)) {
    const spacesLength = xDiff - 1;

    const xOperator = getCoordOperator(initial.x, x);
    const yOperator = getCoordOperator(initial.y, y);

    for (let i = 1; i <= spacesLength; i++) {
      const xResult = operation[xOperator](initial.x, i);
      const yResult = operation[yOperator](initial.y, i);
      if (checkCollision(xResult, yResult)) return false;
    }
    return true;
  }
  return false;
}

function checkQueenRules(obj, x, y) {
  if (checkRookRules(obj, x, y) || checkBishopRules(obj, x, y)) return true;
  return false;
}

function checkKingRules(obj, x, y) {
  const xDiff = Math.abs(obj.x - x);
  const yDiff = Math.abs(obj.y - y);

  if (obj.x === x && obj.y === y) return false;

  if (xDiff <= 1 && yDiff <= 1) return true;

  return false;
}

function getCoordOperator(start, end) {
  if (start < end) return 'sum';
  return 'sub';
}

let operation = {
  sum(a, b) { return a + b; },
  sub(a, b) { return a - b; },
};

function drag(event) {
  if (event.target.classList.contains('game-piece')) {
    const element = event.target;
    const width = element.offsetWidth / 2;
    const height = element.offsetHeight / 2;
    const { player } = element.dataset;

    const turn = game.turn ? BLACK : WHITE;

    if (player === turn) isMoving = true;

    element.addEventListener('mousemove', function (e) {
      if (isMoving) {
        const x = e.clientX - width;
        const y = e.clientY - height;

        const board = BOARD_DOM.getBoundingClientRect();
        const coordX = x - board.x;
        const coordY = y - board.y;

        if (window.matchMedia('(min-width: 500px)').matches) {
          if (coordX < 0 || coordX > 375 || coordY < 0 || coordY > 375) return;
        } else if (coordX < 0 || coordX > 281.25 || coordY < 0 || coordY > 281.25) return;

        const position = `left:${x}px;top:${y}px; z-index: 1;`;
        element.setAttribute('style', position);
        element.classList.add('active');
      }
    });
  }
}

function drop(event) {
  if (isMoving) {
    const element = event.target;
    const { x } = event;
    const { y } = event;

    element.classList.remove('active');

    const coords = getCoordinates(x, y);
    updateBoard(element, coords);
  }

  isMoving = false;
}

function getCoordinates(x, y) {
  const board = BOARD_DOM.getBoundingClientRect();

  const coordX = x - board.x - BOARD_BORDER;
  const coordY = y - board.y - BOARD_BORDER;

  const boardSize = ROW * SQUARE_SIZE;
  const resultX = Math.floor(coordX / boardSize * ROW);
  const resultY = Math.floor(coordY / boardSize * ROW);

  return { x: resultX, y: resultY };
}

function updateBoard(element, coord) {
  const { x } = coord;
  const { y } = coord;
  const id = element.dataset.piece;
  const piece = game.pieces[id];

  game.board[piece.y][piece.x].piece = null;
  piece.update(x, y);
}

function checkCollision(x, y) {
  return (game.board[y][x].piece);
}

function updateTurn() {
  this.turn = !this.turn;

  const classValue = this.turn ? 'player-black' : 'player-white';
  const player = this.turn ? 'Black' : 'White';
  const feedBack = `<div class="${classValue}">Next: ${player}</div>`;

  turnDom.innerHTML = feedBack;
}

let game = {
  board: createBoard(ROW, COL),
  render: renderBoard,
  pieces: {},
  turn: true,
  updateTurn,
  init() {
    BOARD_DOM.addEventListener('mousedown', drag);
    BOARD_DOM.addEventListener('mouseup', drop);

    for (let i = 0; i < 8; i++) {
      new GamePiece(i, 1, PAWN, BLACK, i);
    }

    for (let i = 0; i < 8; i++) {
      new GamePiece(i, 6, PAWN, WHITE, i);
    }

    new GamePiece(0, 7, ROOK, WHITE, 1);
    new GamePiece(7, 7, ROOK, WHITE, 2);
    new GamePiece(1, 7, KNIGHT, WHITE, 1);
    new GamePiece(6, 7, KNIGHT, WHITE, 2);
    new GamePiece(2, 7, BISHOP, WHITE, 1);
    new GamePiece(5, 7, BISHOP, WHITE, 2);
    new GamePiece(3, 7, QUEEN, WHITE, 1);
    new GamePiece(4, 7, KING, WHITE, 1);

    new GamePiece(0, 0, ROOK, BLACK, 1);
    new GamePiece(7, 0, ROOK, BLACK, 2);
    new GamePiece(1, 0, KNIGHT, BLACK, 1);
    new GamePiece(6, 0, KNIGHT, BLACK, 2);
    new GamePiece(2, 0, BISHOP, BLACK, 1);
    new GamePiece(5, 0, BISHOP, BLACK, 2);
    new GamePiece(3, 0, QUEEN, BLACK, 1);
    new GamePiece(4, 0, KING, BLACK, 1);

    this.updateTurn();
    this.render();
  },
};

game.init();
