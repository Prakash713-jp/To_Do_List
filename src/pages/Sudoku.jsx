// src/pages/Sudoku.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUndo,
  FaRedo,
  FaEraser,
  FaRegStickyNote,
  FaLightbulb,
  FaPause,
  FaPlay,
} from "react-icons/fa";

// *** NOTE: This code uses Bootstrap 5 classes. Ensure Bootstrap CSS is imported in your project. ***

const DIFFICULTY_REMOVALS = {
  Easy: 36,
  Medium: 46,
  Hard: 52,
  Expert: 56,
  Master: 60,
  Extreme: 62,
};

const EMPTY_BOARD = () => Array.from({ length: 9 }, () => Array(9).fill(0));

// --- Custom Styles to enforce specific design elements (like Sudoku grid layout and colors) ---
// We use these for CSS properties that Bootstrap utility classes cannot easily define.
const customStyles = {
  // Page Background/Sizing
  page: { minHeight: "100vh", background: "#ebf8ff" }, 
  
  // Board Grid Structure
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    gridTemplateRows: "repeat(9, 1fr)",
    aspectRatio: "1 / 1",
    // CHANGED: Increased maxWidth from 450px to 550px for a larger board on larger screens
    maxWidth: "550px", 
    width: "100%",
  },

  // Cell Content and Styling
  cell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    cursor: "pointer",
    background: "#fff",
    transition: 'background-color 0.15s ease',
  },
  
  // Custom Color Overrides for exact match with original design
  cellFixed: { color: "#1e40af" }, // Original's dark blue text
  cellSelected: { background: "#bfdbfe" }, // Original's light blue selection
  cellHighlight: { background: "#e0f2fe" }, // Original's lighter blue highlight
  cellNumber: { fontSize: 22, fontWeight: 'bold' }, // Adjusted to match number font weight

  // Notes Grid Layout
  notesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    width: "100%",
    height: "100%",
    fontSize: 10,
    color: "#64748b",
  },
  noteItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Custom Border Color (Original: #2b6cb0)
  thickBorderColor: '#2b6cb0',
  thinBorderColor: '#cbd5e1',
  
  // Custom Button Sizing
  circleBtn: { width: 40, height: 40, fontSize: 18 },
};


export default function Sudoku() {
  const [board, setBoard] = useState(EMPTY_BOARD());
  const [solution, setSolution] = useState(EMPTY_BOARD());
  const [fixed, setFixed] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(false))
  );
  const [notes, setNotes] = useState(
    Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    )
  );

  const [difficulty, setDifficulty] = useState("Easy");
  const [selected, setSelected] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const timerRef = useRef(null);

  // --- Core Game Logic (Unchanged) ---

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  useEffect(() => {
    startNewGame(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const cloneBoard = (b) => b.map((r) => [...r]);
  const cloneNotes = (n) =>
    n.map((r) => r.map((s) => new Set(Array.from(s))));

  /** Sudoku generator */
  function generateFullSolution() {
    const grid = EMPTY_BOARD();
    const nums = () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const canPlace = (g, r, c, val) => {
      for (let i = 0; i < 9; i++) {
        if (g[r][i] === val) return false;
        if (g[i][c] === val) return false;
      }
      const sr = Math.floor(r / 3) * 3;
      const sc = Math.floor(c / 3) * 3;
      for (let i = sr; i < sr + 3; i++) {
        for (let j = sc; j < sc + 3; j++) {
          if (g[i][j] === val) return false;
        }
      }
      return true;
    };
    function backtrack(pos = 0) {
      if (pos === 81) return true;
      const r = Math.floor(pos / 9);
      const c = pos % 9;
      const shuffled = nums();
      for (let val of shuffled) {
        if (canPlace(grid, r, c, val)) {
          grid[r][c] = val;
          if (backtrack(pos + 1)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    }
    backtrack(0);
    return grid;
  }

  function removeCellsFromSolution(sol, removals) {
    const boardCopy = cloneBoard(sol);
    let attempts = 0;
    let removed = 0;
    while (removed < removals && attempts < removals * 5 + 200) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (boardCopy[r][c] !== 0) {
        boardCopy[r][c] = 0;
        removed++;
      }
      attempts++;
    }
    return boardCopy;
  }

  function createPuzzle(level = "Easy") {
    const sol = generateFullSolution();
    const removals = DIFFICULTY_REMOVALS[level] ?? DIFFICULTY_REMOVALS.Easy;
    const puzzle = removeCellsFromSolution(sol, removals);
    const fixedGrid = puzzle.map((r) => r.map((v) => v !== 0));
    const notesGrid = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
    return { puzzle, sol, fixedGrid, notesGrid };
  }

  function pushUndoState() {
    const snapshot = {
      board: cloneBoard(board),
      notes: cloneNotes(notes),
      mistakes,
      score,
      selected,
    };
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 200) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  }

  function startNewGame(level = "Easy") {
    undoStackRef.current = [];
    redoStackRef.current = [];
    const { puzzle, sol, fixedGrid, notesGrid } = createPuzzle(level);
    setBoard(puzzle);
    setSolution(sol);
    setFixed(fixedGrid);
    setNotes(notesGrid);
    setMistakes(0);
    setTime(0);
    setScore(0);
    setIsPaused(false);
    setSelected(null);
    setNotesMode(false);
  }

  function onSelectCell(r, c) {
    if (isPaused) return;
    setSelected({ r, c });
  }

  function placeNumber(num) {
    if (!selected) return;
    const { r, c } = selected;
    if (fixed[r][c]) return;
    pushUndoState();
    if (notesMode) {
      const newNotes = cloneNotes(notes);
      if (newNotes[r][c].has(num)) newNotes[r][c].delete(num);
      else newNotes[r][c].add(num);
      setNotes(newNotes);
      return;
    }
    const newBoard = cloneBoard(board);
    newBoard[r][c] = num;
    const newNotes = cloneNotes(notes);
    newNotes[r][c] = new Set();
    if (solution[r][c] === num) {
      setBoard(newBoard);
      setNotes(newNotes);
      setScore((s) => s + 10);
    } else {
      setBoard(newBoard);
      setNotes(newNotes);
      setMistakes((m) => m + 1);
    }
  }

  function eraseCell() {
    if (!selected) return;
    const { r, c } = selected;
    if (fixed[r][c]) return;
    pushUndoState();
    const newBoard = cloneBoard(board);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    const newNotes = cloneNotes(notes);
    newNotes[r][c] = new Set();
    setNotes(newNotes);
  }

  function hintFill() {
    pushUndoState();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!fixed[r][c] && board[r][c] !== solution[r][c]) {
          const newBoard = cloneBoard(board);
          newBoard[r][c] = solution[r][c];
          const newNotes = cloneNotes(notes);
          newNotes[r][c] = new Set();
          setBoard(newBoard);
          setNotes(newNotes);
          setScore((s) => s + 5);
          setSelected({ r, c });
          return;
        }
      }
    }
  }

  function handleUndo() {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const snapshot = stack.pop();
    redoStackRef.current.push({
      board: cloneBoard(board),
      notes: cloneNotes(notes),
      mistakes,
      score,
      selected,
    });
    setBoard(snapshot.board);
    setNotes(snapshot.notes);
    setMistakes(snapshot.mistakes);
    setScore(snapshot.score);
    setSelected(snapshot.selected);
  }

  function handleRedo() {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    const snapshot = stack.pop();
    undoStackRef.current.push({
      board: cloneBoard(board),
      notes: cloneNotes(notes),
      mistakes,
      score,
      selected,
    });
    setBoard(snapshot.board);
    setNotes(snapshot.notes);
    setMistakes(snapshot.mistakes);
    setScore(snapshot.score);
    setSelected(snapshot.selected);
  }

  useEffect(() => {
    function onKey(e) {
      if (isPaused) return;
      if (!selected) return;
      const k = e.key;
      if (k >= "1" && k <= "9") {
        placeNumber(Number(k));
      } else if (k === "Backspace" || k === "Delete" || k === "0") {
        eraseCell();
      } else if (k === "n") {
        setNotesMode((v) => !v);
      } else if (k === "h") {
        hintFill();
      } else if (e.ctrlKey && k === "z") {
        handleUndo();
      } else if (e.ctrlKey && (k === "y" || (e.shiftKey && k === "Z"))) {
        handleRedo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, board, notes, isPaused, solution]);

  /** Check win/lose */
  useEffect(() => {
    // Skip until a valid puzzle is generated
    if (!solution || solution.every(row => row.every(v => v === 0))) return;

    if (mistakes >= 3) {
      setIsPaused(true);
      alert("❌ Game Over — too many mistakes!");
    }

    let won = true;
    for (let r = 0; r < 9 && won; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) {
          won = false;
          break;
        }
      }
    }

    if (won) {
      setIsPaused(true);
      alert(`🎉 Congratulations! You solved it in ${formatTime(time)}.`);
    }
  }, [mistakes, board, solution, time]);


  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function renderCellContent(r, c) {
    const val = board[r][c];
    if (val !== 0) return <div style={customStyles.cellNumber}>{val}</div>;
    const cellNotes = notes[r][c];
    if (cellNotes.size === 0) return null;
    const arr = Array.from({ length: 9 }, (_, i) =>
      cellNotes.has(i + 1) ? i + 1 : ""
    );
    return (
      <div style={customStyles.notesGrid}>
        {arr.map((n, idx) => (
          <div key={idx} style={customStyles.noteItem}>
            {n}
          </div>
        ))}
      </div>
    );
  }
  
  // Custom function to handle dynamic cell styling using inline styles and Bootstrap classes
  const getCellStyle = (r, c) => {
    const isFixed = fixed[r][c];
    const isSelected = selected && selected.r === r && selected.c === c;
    const highlight =
      selected &&
      (selected.r === r ||
        selected.c === c ||
        (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
          Math.floor(selected.c / 3) === Math.floor(c / 3)));
          
    const cellStyle = {
      ...customStyles.cell,
      // Default thin border
      border: `1px solid ${customStyles.thinBorderColor}`,
      
      // Thick block borders
      borderRight: c % 3 === 2 ? `3px solid ${customStyles.thickBorderColor}` : `1px solid ${customStyles.thinBorderColor}`,
      borderBottom: r % 3 === 2 ? `3px solid ${customStyles.thickBorderColor}` : `1px solid ${customStyles.thinBorderColor}`,
      borderLeft: c === 0 ? `3px solid ${customStyles.thickBorderColor}` : undefined,
      borderTop: r === 0 ? `3px solid ${customStyles.thickBorderColor}` : undefined,
    };
    
    // Apply state-based colors
    if (highlight && !isSelected) {
      Object.assign(cellStyle, customStyles.cellHighlight);
    }
    if (isSelected) {
      Object.assign(cellStyle, customStyles.cellSelected);
    }
    if (isFixed) {
      Object.assign(cellStyle, customStyles.cellFixed);
    }
    
    // Apply mistake color (red text)
    if (board[r][c] !== 0 && solution[r][c] !== board[r][c]) {
        cellStyle.color = 'red'; // Apply red text for mistakes
    } else if (isFixed) {
        cellStyle.color = customStyles.cellFixed.color; // Reapply fixed color if not a mistake
    }

    return cellStyle;
  };
  
  // --- Render Function with Bootstrap Classes ---
  
  return (
    // Use container-fluid for full width, p-3 for padding, and custom background color
    <div className="container-fluid p-3 p-lg-5" style={customStyles.page}>
      
      {/* Main Content Row: Centered and responsive */}
      <div className="row justify-content-center">
        {/* CHANGED: Increased the maximum container width for the content from col-xl-10 to col-xl-11 */}
        <div className="col-12 col-xl-11"> 
          
          {/* Layout Row for Side-by-Side (Large) or Stacked (Small) */}
          <div className="row g-4 justify-content-center align-items-start">

            {/* Left Column: Board and Stats */}
            {/* CHANGED: Increased the board column width from col-lg-7 to col-lg-8 */}
            <div className="col-12 col-lg-8 d-flex flex-column gap-4"> 
              
              {/* Difficulty + Stats (topBar) */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="mb-3">
                  <span className="fw-bold fs-6">Difficulty</span>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {Object.keys(DIFFICULTY_REMOVALS).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => startNewGame(lvl)} // New game starts on difficulty change
                        className={`btn btn-sm text-uppercase ${
                          difficulty === lvl 
                            ? 'btn-primary' 
                            : 'btn-outline-secondary'
                        }`}
                        // Match original button design colors
                        style={difficulty === lvl ? { background: '#2563eb', borderColor: '#2563eb' } : { borderColor: '#cbd5e1', background: '#f1f5f9' }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between pt-2 border-top">
                  <div className="text-center">
                    <div className="text-muted small" style={{color: '#4b5563'}}>Score</div>
                    <div className="fw-bold">{score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted small" style={{color: '#4b5563'}}>Mistakes</div>
                    <div className="fw-bold text-danger">{mistakes}/3</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted small" style={{color: '#4b5563'}}>Time</div>
                    <div className="fw-bold d-flex align-items-center justify-content-center">
                      {formatTime(time)}{" "}
                      <button
                        onClick={() => setIsPaused((p) => !p)}
                        title={isPaused ? "Resume" : "Pause"}
                        className="btn btn-sm ms-2"
                        // Match original iconBtnSmall design
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "2px 6px",
                          lineHeight: 1,
                        }}
                      >
                        {isPaused ? <FaPlay /> : <FaPause />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Board */}
              <div className="d-flex justify-content-center">
                <div className="p-0 bg-white shadow" style={customStyles.boardGrid}>
                  {board.map((row, r) =>
                    row.map((_, c) => {
                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => onSelectCell(r, c)}
                          // Pass dynamic styles based on selection/highlights/mistakes
                          style={getCellStyle(r, c)}
                        >
                          {renderCellContent(r, c)}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Controls and Keypad */}
            {/* CHANGED: Decreased the controls column width from col-lg-5 to col-lg-4 */}
            <div className="col-12 col-lg-4 d-flex flex-column gap-4"> 
              
              {/* Controls Row */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUndo}
                  title="Undo (Ctrl+Z)"
                  className="rounded-circle btn btn-light border"
                  style={{ ...customStyles.circleBtn, borderColor: '#cbd5e1', background: '#f8fafc' }}
                >
                  <FaUndo />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRedo}
                  title="Redo (Ctrl+Y)"
                  className="rounded-circle btn btn-light border"
                  style={{ ...customStyles.circleBtn, borderColor: '#cbd5e1', background: '#f8fafc' }}
                >
                  <FaRedo />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={eraseCell}
                  title="Eraser"
                  className="rounded-circle btn btn-light border"
                  style={{ ...customStyles.circleBtn, borderColor: '#cbd5e1', background: '#f8fafc' }}
                >
                  <FaEraser />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotesMode((v) => !v)}
                  title="Notes (toggle)"
                  className={`rounded-circle btn ${
                    notesMode ? 'btn-primary' : 'btn-light border'
                  }`}
                  // Match original active color and size
                  style={{ 
                    ...customStyles.circleBtn, 
                    ...(notesMode ? { background: '#2563eb', borderColor: '#2563eb', color: '#fff' } : { borderColor: '#cbd5e1', background: '#f8fafc' }) 
                  }}
                >
                  <FaRegStickyNote />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={hintFill}
                  title="Hint"
                  className="rounded-circle btn btn-light border"
                  style={{ ...customStyles.circleBtn, borderColor: '#cbd5e1', background: '#f8fafc' }}
                >
                  <FaLightbulb />
                </motion.button>
              </div>

              {/* Keypad */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      key={n}
                      onClick={() => placeNumber(n)}
                      className="btn btn-lg border"
                      title={`Place ${n}`}
                      // Match original keyBtn design
                      style={{ 
                        padding: 14, 
                        fontSize: 18, 
                        borderRadius: 8, 
                        borderColor: '#cbd5e1', 
                        background: '#f8fafc' 
                      }}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>

                {/* Keypad Actions */}
                <div className="d-grid gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (!selected) return;
                      pushUndoState();
                      const { r, c } = selected;
                      const newNotes = cloneNotes(notes);
                      newNotes[r][c] = new Set();
                      setNotes(newNotes);
                    }}
                    className="btn border"
                    // Match original actionBtn design
                    style={{ padding: "8px 10px", borderColor: '#cbd5e1', background: '#f1f5f9' }}
                  >
                    Clear Notes
                  </button>

                  <button
                    onClick={() => startNewGame(difficulty)}
                    className="btn btn-primary"
                    // Match original New Game button design
                    style={{ background: "#2563eb", color: "#fff", borderColor: '#2563eb' }}
                  >
                    New Game
                  </button>
                </div>
              </div>

              {/* Help/Tips */}
              <div className="p-2" style={{ fontSize: 13, color: "#2d3748" }}>
                Tips: Tap a cell then use keypad or keyboard (1–9). Press **"n"** to
                toggle notes, **"h"** for hint, **Backspace** to erase.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}