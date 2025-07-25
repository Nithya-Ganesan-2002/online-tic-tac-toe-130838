import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// Basic render test for initial UI
test("renders Tic Tac Toe header and initial empty grid", () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/Play (a|the) classic/i)).toBeInTheDocument();
  // Should be 9 squares on initial render
  const emptySquares = screen.getAllByRole("button", { name: "Empty" });
  expect(emptySquares.length).toBe(9);
});

// Simulates a full game with a win for X
test("X wins after a valid game", () => {
  render(<App />);
  const squares = screen.getAllByRole("button");
  // X O X
  // O X 
  //     X
  fireEvent.click(squares[0]); // X
  fireEvent.click(squares[1]); // O
  fireEvent.click(squares[4]); // X
  fireEvent.click(squares[2]); // O
  fireEvent.click(squares[8]); // X
  // X wins with (0,4,8)
  expect(screen.getByText(/wins!/i)).toBeInTheDocument();
  expect(screen.getByText("X")).toBeInTheDocument();
});

// Draw scenario test
test("detects a draw", () => {
  render(<App />);
  const squares = screen.getAllByRole("button");
  // X O X
  // X X O
  // O X O
  const moves = [0,1,2,4,3,5,7,6,8]; // End state: draw
  moves.forEach((idx, i) => {
    fireEvent.click(squares[idx]);
  });
  expect(screen.getByText(/draw/i)).toBeInTheDocument();
});

// Restart/new game button resets board
test("restart resets board", () => {
  render(<App />);
  const squares = screen.getAllByRole("button");
  fireEvent.click(squares[0]); // X
  fireEvent.click(squares[1]); // O
  expect(squares[0].textContent).toBe("X");
  expect(squares[1].textContent).toBe("O");
  const btn = screen.getByRole("button", { name: /restart/i });
  fireEvent.click(btn);
  const newSquares = screen.getAllByRole("button", { name: "Empty" });
  expect(newSquares.length).toBe(9);
});
