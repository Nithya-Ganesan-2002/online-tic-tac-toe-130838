import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Tic Tac Toe - React Modern Light UI
 * Implements the 3x3 game board, game state, status, and restart in a centered, responsive manner.
 * Theme colors: primary (#1976d2), accent (#ff9800), secondary (#424242)
 */

// Helper for checking a win condition
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /**
   * Checks the current game board for a winner or draw.
   * @param {array} squares - Flat array of 9 elements, each "X", "O", or null.
   * @returns {object} {winner, line}, or {draw: true}, or null
   */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // Check win
  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  // Check draw
  if (squares.every((s) => s)) {
    return { draw: true };
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // Board is an array of 9: null|"X"|"O"
  const [board, setBoard] = useState(Array(9).fill(null));
  // X goes first
  const [xIsNext, setXIsNext] = useState(true);
  // "X", "O", "draw", or null
  const [outcome, setOutcome] = useState(null);
  // Highlighted line if winner
  const [winLine, setWinLine] = useState([]);

  // Reset the game to the initial state
  // PUBLIC_INTERFACE
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setOutcome(null);
    setWinLine([]);
  };

  // Handle a player click on a square
  // PUBLIC_INTERFACE
  const handleSquareClick = (idx) => {
    if (board[idx] || outcome) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  // Detect win/draw state after each move
  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      if (result.winner) {
        setOutcome(result.winner);
        setWinLine(result.line);
      } else if (result.draw) {
        setOutcome("draw");
      }
    } else {
      setOutcome(null);
      setWinLine([]);
    }
  }, [board]);

  // Status message at top of board
  let status;
  if (outcome === "draw") {
    status = (
      <span className="status-draw">
        <span role="img" aria-label="draw">🤝</span> It's a draw!
      </span>
    );
  } else if (outcome === "X" || outcome === "O") {
    status = (
      <span className="status-winner">
        <span
          className="winner-marker"
          style={{
            color: outcome === "X" ? "var(--primary)" : "var(--accent)"
          }}
        >
          {outcome}
        </span>
        {" "}wins!
        <span role="img" aria-label="trophy"> 🏆</span>
      </span>
    );
  } else {
    status = (
      <span className="status-next">
        <span
          className="next-marker"
          style={{
            color: xIsNext ? "var(--primary)" : "var(--accent)"
          }}
        >
          {xIsNext ? "X" : "O"}
        </span>
        {" 's turn"}
      </span>
    );
  }

  return (
    <div className="ttt-app-bg">
      <div className="ttt-container">
        <header className="ttt-header">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <div className="ttt-sub">Play a classic 3x3 game</div>
        </header>
        <main className="ttt-main">
          <div className="status-bar" data-testid="status-bar">{status}</div>
          <Board
            squares={board}
            onClick={handleSquareClick}
            winLine={winLine}
            gameEnded={!!outcome}
          />
          <button
            className="ttt-restart-btn"
            onClick={resetGame}
            aria-label="Restart Game"
            data-testid="restart-btn"
          >
            {outcome ? "New Game" : "Restart"}
          </button>
        </main>
        <footer className="ttt-footer">
          <span>React Tic Tac Toe • Modern UI &copy; {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onClick, winLine, gameEnded }) {
  /**
   * Renders the 3x3 board.
   */
  // Row numbers: [0,1,2], [3,4,5], [6,7,8]
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row} role="row">
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            const isWinning = winLine && winLine.includes(idx);
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onClick={() => onClick(idx)}
                isWinning={isWinning}
                gameEnded={gameEnded}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function Square({ value, onClick, isWinning, gameEnded }) {
  /**
   * One Tic Tac Toe square.
   */
  let marker = value;
  return (
    <button
      className={
        "ttt-square" +
        (isWinning ? " ttt-square-win" : "") +
        (value === "X" ? " ttt-square-x" : value === "O" ? " ttt-square-o" : "") +
        (gameEnded && !value ? " ttt-square-disabled" : "")
      }
      onClick={onClick}
      disabled={gameEnded || !!value}
      aria-label={value ? value : "Empty"}
      tabIndex={value || gameEnded ? -1 : 0}
      data-testid={`square-${marker ? marker : "empty"}`}
    >
      {marker}
    </button>
  );
}

export default App;
