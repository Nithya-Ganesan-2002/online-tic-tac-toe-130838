import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * Tic Tac Toe - React Modern Light UI
 * Implements the 3x3 game board, game state, status, and restart in a centered, responsive manner.
 * Theme colors: primary (#1976d2), accent (#ff9800), secondary (#424242)
 * Now supports Player vs Player and Player vs AI modes.
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

/**
 * AI move selection algorithm (default: easy mode is random move)
 */
function getRandomMove(squares) {
  // Returns a random available move (cell index)
  const available = [];
  for (let i = 0; i < squares.length; ++i) {
    if (!squares[i]) available.push(i);
  }
  if (available.length === 0) return null;
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

/**
 * Can be enhanced: implement minimax in future for 'hard' mode.
 */

// PUBLIC_INTERFACE
function App() {
  // Game mode: 'pvp' or 'ai'
  const [mode, setMode] = useState("pvp");
  // If AI mode: which marker does human play? "X" or "O"
  const [humanMarker, setHumanMarker] = useState("X");
  // Board is an array of 9: null|"X"|"O"
  const [board, setBoard] = useState(Array(9).fill(null));
  // X goes first
  const [xIsNext, setXIsNext] = useState(true);
  // "X", "O", "draw", or null
  const [outcome, setOutcome] = useState(null);
  // Highlighted line if winner
  const [winLine, setWinLine] = useState([]);
  // Indicate whether it's AI's turn for display/animation
  const [aiThinking, setAiThinking] = useState(false);

  // For stable refs during AI moves (avoid double/async bugs)
  const boardRef = useRef(board);
  const xIsNextRef = useRef(xIsNext);
  const modeRef = useRef(mode);
  const humanMarkerRef = useRef(humanMarker);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { xIsNextRef.current = xIsNext; }, [xIsNext]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { humanMarkerRef.current = humanMarker; }, [humanMarker]);

  // Reset the game to the initial state
  // PUBLIC_INTERFACE
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setOutcome(null);
    setWinLine([]);
    setAiThinking(false);
  };

  // PUBLIC_INTERFACE
  // Handle Square Click by player (human)
  const handleSquareClick = (idx) => {
    if (board[idx] || outcome) return;
    // In AI mode, prevent player clicking on AI's turn
    if (mode === "ai" && getCurrentPlayer() !== humanMarker) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    setAiThinking(false); // If auto-advanced after AI, reset AI thinking
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

  // Side effect: if in AI mode and it's the AI's turn, make the AI move after a short delay
  useEffect(() => {
    if (
      mode === "ai" &&
      !outcome &&
      getCurrentPlayer() !== humanMarker
    ) {
      setAiThinking(true);
      // Wait 550ms for "AI thinking" effect
      const aiTimeout = setTimeout(() => {
        const move = getRandomMove(boardRef.current);
        if (move != null && !calculateWinner(boardRef.current)) {
          const newBoard = boardRef.current.slice();
          newBoard[move] = xIsNextRef.current ? "X" : "O";
          setBoard(newBoard);
          setXIsNext(!xIsNextRef.current);
          setAiThinking(false);
        } else {
          setAiThinking(false);
        }
      }, 550);
      return () => clearTimeout(aiTimeout);
    }
    setAiThinking(false);
  // eslint-disable-next-line
  }, [mode, board, xIsNext, outcome, humanMarker]);

  // Mode selection and allow AI player marker selection
  function handleModeChange(e) {
    const selected = e.target.value;
    setMode(selected);
    // If switching to PvP, always X first
    if (selected === "pvp") {
      setHumanMarker("X");
    }
    resetGame();
  }
  function handleMarkerChange(e) {
    setHumanMarker(e.target.value);
    resetGame();
  }

  // Determine turn. Returns "X" or "O"
  function getCurrentPlayer() {
    return xIsNext ? "X" : "O";
  }

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
          data-o={outcome === "O" ? "true" : undefined}
        >
          {outcome}
        </span>
        {" "}wins!
        <span role="img" aria-label="trophy"> 🏆</span>
      </span>
    );
  } else if (mode === "ai") {
    // PvAI status
    if (getCurrentPlayer() === humanMarker) {
      status = (
        <span className="status-next">
          <span
            className="next-marker"
            style={{
              color: humanMarker === "X" ? "var(--primary)" : "var(--accent)"
            }}
          >
            You
          </span>
          {"'s turn"}
        </span>
      );
    } else {
      status = (
        <span className="status-next" aria-live="polite">
          <span
            className="next-marker"
            style={{
              color: humanMarker === "X" ? "var(--accent)" : "var(--primary)"
            }}
          >AI</span>
          {aiThinking ? " is making a move..." : "'s turn"}
        </span>
      );
    }
  } else {
    // PvP status
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
          <div className="ttt-sub">
             Play a classic 3x3 game
          </div>
        </header>
        <main className="ttt-main">
          {/* Mode Toggle UI */}
          <ModeSelector
            mode={mode}
            onModeChange={handleModeChange}
            humanMarker={humanMarker}
            onMarkerChange={handleMarkerChange}
            aiMarker={humanMarker === "X" ? "O" : "X"}
          />
          <div className="status-bar" data-testid="status-bar">{status}</div>
          <Board
            squares={board}
            onClick={handleSquareClick}
            winLine={winLine}
            gameEnded={!!outcome}
            aiThinking={aiThinking}
            mode={mode}
            humanMarker={humanMarker}
          />
          <button
            className="ttt-restart-btn"
            onClick={resetGame}
            aria-label="Restart Game"
            data-testid="restart-btn"
            disabled={aiThinking}
            style={aiThinking ? { opacity: 0.59 } : {}}
          >
            {outcome ? "New Game" : "Restart"}
          </button>
        </main>
        <footer className="ttt-footer">
          <span>
            React Tic Tac Toe &bull; Modern UI &copy; {new Date().getFullYear()}
            <br/>
            <span style={{fontSize:"0.946em"}}>
              {/* Link/help to Upgrade AI difficulty (future, not implemented here) */}
              <span style={{color:"var(--accent)"}}><b>AI:</b></span> "Easy" (random moves) &mdash; <span style={{color:"var(--text-dim)"}}>Challenge coming soon!</span>
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function ModeSelector({ mode, onModeChange, humanMarker, onMarkerChange, aiMarker }) {
  /**
   * UI for selecting game mode (PvP or PvAI) and, in AI mode, which marker the human will play.
   */
  return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", gap: "1.2rem",
      marginBottom: "1.15em", marginTop: "0.4em"
    }}>
      <fieldset style={{
        border: "none", padding: 0, margin: 0, display: "flex", alignItems:"center", gap: "0.4rem"
      }}>
        <legend style={{
          fontWeight: 600, fontSize: "1.07em", color:"var(--primary)", marginRight: 2
        }}>Mode:</legend>
        <label style={{marginRight:"0.57em"}}>
          <input
            type="radio"
            value="pvp"
            checked={mode === "pvp"}
            onChange={onModeChange}
          /> PvP
        </label>
        <label>
          <input
            type="radio"
            value="ai"
            checked={mode === "ai"}
            onChange={onModeChange}
          /> Play vs AI
        </label>
      </fieldset>
      {mode === "ai" && (
        <fieldset style={{
          border: "none", margin: 0, padding: 0, display: "flex", alignItems:"center", gap:"0.26em"
        }}>
          <legend style={{
            fontWeight: 500, fontSize: "1em", color:"var(--accent)", marginRight:2
          }}>You play:</legend>
          <label style={{marginRight:"0.49em"}}>
            <input
              type="radio"
              value="X"
              checked={humanMarker === "X"}
              onChange={onMarkerChange}
            /> 
            <span style={{color:"var(--primary)", fontWeight:700}}>X</span>
          </label>
          <label>
            <input
              type="radio"
              value="O"
              checked={humanMarker === "O"}
              onChange={onMarkerChange}
            /> 
            <span style={{color:"var(--accent)", fontWeight:800}}>O</span>
          </label>
        </fieldset>
      )}
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
