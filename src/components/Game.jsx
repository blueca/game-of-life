import React from 'react';
import Cells from './Cells';
import Controls from './Controls';

class Game extends React.Component {
  state = {
    cells: [],
    cellSize: 20,
    width: 1000,
    height: 800,
    rows: 40, //height / cellsize
    cols: 50, //width / cellsize
    board: null,
    interval: 100,
    isRunning: false,
    randomDensity: 0.3,
    generation: 0,
  };

  componentDidMount = () => {
    const board = this.makeEmptyBoard();
    this.setState({ board });
  };

  render() {
    const { cells } = this.state;

    return (
      <div>
        <Controls
          isRunning={this.state.isRunning}
          stopGame={this.stopGame}
          runGame={this.runGame}
          clearBoard={this.clearBoard}
          randomBoard={this.randomBoard}
          selectPattern={this.selectPattern}
          changeDensity={this.changeDensity}
        />
        <div
          className="Board"
          style={{
            width: this.state.width,
            height: this.state.height,
            backgroundSize: `${this.state.cellSize}px ${this.state.cellSize}px`,
          }}
          onClick={this.handleClick}
          ref={(n) => {
            this.boardRef = n;
          }}
        >
          {cells.map((cell) => (
            <Cells
              x={cell.x}
              y={cell.y}
              key={`${cell.x},${cell.y}`}
              cellSize={this.state.cellSize}
            />
          ))}
        </div>
        <p>Generation: {this.state.generation}</p>
        <p>Population: {this.state.cells.length}</p>
      </div>
    );
  }

  makeEmptyBoard = () => {
    let board = [];

    for (let y = 0; y < this.state.rows; y++) {
      board[y] = [];
      for (let x = 0; x < this.state.cols; x++) {
        board[y][x] = false;
      }
    }
    return board;
  };

  makeCells = (newState) => {
    let cells = [];

    for (let y = 0; y < newState.rows; y++) {
      for (let x = 0; x < newState.cols; x++) {
        if (newState.board[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  };

  getElementOffset = () => {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  };

  handleClick = (event) => {
    const elemOffset = this.getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;
    const x = Math.floor(offsetX / this.state.cellSize);
    const y = Math.floor(offsetY / this.state.cellSize);

    this.setState((currentState) => {
      const newState = this.cloneState(currentState);
      if (x >= 0 && x <= newState.cols && y >= 0 && y <= newState.rows) {
        newState.board[y][x] = !newState.board[y][x];
      }
      newState.cells = this.makeCells(newState);
      return newState;
    });
  };

  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };

  stopGame = () => {
    this.setState({ isRunning: false });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };

  runIteration = () => {
    let newBoard = this.makeEmptyBoard();

    for (let y = 0; y < this.state.rows; y++) {
      for (let x = 0; x < this.state.cols; x++) {
        let neighbors = this.calculateNeighbors(this.state.board, x, y);
        if (this.state.board[y][x]) {
          if (neighbors === 2 || neighbors === 3) {
            newBoard[y][x] = true;
          } else {
            newBoard[y][x] = false;
          }
        } else {
          if (!this.state.board[y][x] && neighbors === 3) {
            newBoard[y][x] = true;
          }
        }
      }
    }

    this.setState((currentState) => {
      return {
        board: newBoard,
        cells: this.makeCells(currentState),
        generation: currentState.generation + 1,
      };
    });
    this.timeoutHandler = window.setTimeout(() => {
      this.runIteration();
    }, this.state.interval);
  };

  calculateNeighbors = (board, x, y) => {
    let neighbors = 0;
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];

      if (
        x1 >= 0 &&
        x1 < this.state.cols &&
        y1 >= 0 &&
        y1 < this.state.rows &&
        this.state.board[y1][x1]
      ) {
        neighbors++;
      }
    }
    return neighbors;
  };

  clearBoard = () => {
    this.stopGame();
    const newBoard = this.makeEmptyBoard();
    this.setState({ board: newBoard, cells: [], generation: 0 });
  };

  randomBoard = (event) => {
    this.stopGame();
    const newBoard = this.makeEmptyBoard();

    let cells = [];

    for (let y = 0; y < this.state.rows; y++) {
      for (let x = 0; x < this.state.cols; x++) {
        if (Math.random() < this.state.randomDensity) {
          cells.push({ x, y });
          newBoard[y][x] = true;
        }
      }
    }

    this.setState({ cells: cells, board: newBoard, generation: 0 });
  };

  cloneState = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    const copy = obj.constructor();
    for (const key in obj) {
      copy[key] = this.cloneState(obj[key]);
    }
    return copy;
  };

  selectPattern = (event) => {
    this.stopGame();

    const patterns = {
      glider: [
        { x: 4, y: 34 },
        { x: 5, y: 34 },
        { x: 5, y: 35 },
        { x: 6, y: 35 },
        { x: 4, y: 36 },
      ],
      gliderGun: [
        { x: 24, y: 0 },
        { x: 22, y: 1 },
        { x: 24, y: 1 },
        { x: 12, y: 2 },
        { x: 13, y: 2 },
        { x: 20, y: 2 },
        { x: 21, y: 2 },
        { x: 34, y: 2 },
        { x: 35, y: 2 },
        { x: 11, y: 3 },
        { x: 15, y: 3 },
        { x: 20, y: 3 },
        { x: 21, y: 3 },
        { x: 34, y: 3 },
        { x: 35, y: 3 },
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 10, y: 4 },
        { x: 16, y: 4 },
        { x: 20, y: 4 },
        { x: 21, y: 4 },
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 10, y: 5 },
        { x: 14, y: 5 },
        { x: 16, y: 5 },
        { x: 17, y: 5 },
        { x: 22, y: 5 },
        { x: 24, y: 5 },
        { x: 10, y: 6 },
        { x: 16, y: 6 },
        { x: 24, y: 6 },
        { x: 11, y: 7 },
        { x: 15, y: 7 },
        { x: 12, y: 8 },
        { x: 13, y: 8 },
      ],
      line: [
        { x: 5, y: 16 },
        { x: 6, y: 16 },
        { x: 7, y: 16 },
        { x: 8, y: 16 },
        { x: 9, y: 16 },
        { x: 10, y: 16 },
        { x: 11, y: 16 },
        { x: 12, y: 16 },
        { x: 14, y: 16 },
        { x: 15, y: 16 },
        { x: 16, y: 16 },
        { x: 17, y: 16 },
        { x: 18, y: 16 },
        { x: 22, y: 16 },
        { x: 23, y: 16 },
        { x: 24, y: 16 },
        { x: 31, y: 16 },
        { x: 32, y: 16 },
        { x: 33, y: 16 },
        { x: 34, y: 16 },
        { x: 35, y: 16 },
        { x: 36, y: 16 },
        { x: 37, y: 16 },
        { x: 39, y: 16 },
        { x: 40, y: 16 },
        { x: 41, y: 16 },
        { x: 42, y: 16 },
        { x: 43, y: 16 },
      ],
      stairs: [
        { x: 28, y: 16 },
        { x: 26, y: 17 },
        { x: 28, y: 17 },
        { x: 29, y: 17 },
        { x: 26, y: 18 },
        { x: 28, y: 18 },
        { x: 26, y: 19 },
        { x: 24, y: 20 },
        { x: 22, y: 21 },
        { x: 24, y: 21 },
      ],
      square: [
        { x: 21, y: 21 },
        { x: 22, y: 21 },
        { x: 23, y: 21 },
        { x: 25, y: 21 },
        { x: 21, y: 22 },
        { x: 24, y: 23 },
        { x: 25, y: 23 },
        { x: 22, y: 24 },
        { x: 23, y: 24 },
        { x: 25, y: 24 },
        { x: 21, y: 25 },
        { x: 23, y: 25 },
        { x: 25, y: 25 },
      ],
      pulsar: [
        { x: 21, y: 10 },
        { x: 22, y: 10 },
        { x: 23, y: 10 },
        { x: 27, y: 10 },
        { x: 28, y: 10 },
        { x: 29, y: 10 },
        { x: 20, y: 11 },
        { x: 24, y: 11 },
        { x: 26, y: 11 },
        { x: 30, y: 11 },
        { x: 20, y: 12 },
        { x: 24, y: 12 },
        { x: 26, y: 12 },
        { x: 30, y: 12 },
        { x: 20, y: 13 },
        { x: 24, y: 13 },
        { x: 26, y: 13 },
        { x: 30, y: 13 },
        { x: 21, y: 14 },
        { x: 22, y: 14 },
        { x: 23, y: 14 },
        { x: 27, y: 14 },
        { x: 28, y: 14 },
        { x: 29, y: 14 },
        { x: 21, y: 16 },
        { x: 22, y: 16 },
        { x: 23, y: 16 },
        { x: 27, y: 16 },
        { x: 28, y: 16 },
        { x: 29, y: 16 },
        { x: 20, y: 17 },
        { x: 24, y: 17 },
        { x: 26, y: 17 },
        { x: 30, y: 17 },
        { x: 20, y: 18 },
        { x: 24, y: 18 },
        { x: 26, y: 18 },
        { x: 30, y: 18 },
        { x: 20, y: 19 },
        { x: 24, y: 19 },
        { x: 26, y: 19 },
        { x: 30, y: 19 },
        { x: 21, y: 20 },
        { x: 22, y: 20 },
        { x: 23, y: 20 },
        { x: 27, y: 20 },
        { x: 28, y: 20 },
        { x: 29, y: 20 },
      ],
    };

    const newBoard = this.makeEmptyBoard();
    const cells = patterns[event.target.value];

    for (const { x, y } of cells) {
      newBoard[y][x] = true;
    }

    this.setState({
      cells: cells,
      board: newBoard,
      generation: 0,
    });
  };

  changeDensity = (event) => {
    const selectedDensity = event.target.value / 100;
    this.setState({ randomDensity: selectedDensity });
  };
}

export default Game;
