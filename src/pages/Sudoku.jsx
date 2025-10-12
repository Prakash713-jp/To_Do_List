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

const DIFFICULTY_REMOVALS = {
  Easy: 36,
  Medium: 46,
  Hard: 52,
  Expert: 56,
  Master: 60,
  Extreme: 62,
};

const EMPTY_BOARD = () => Array.from({ length: 9 }, () => Array(9).fill(0));

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
    setScore(0);
    setTime(0);
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
    if (val !== 0) return <div style={styles.cellNumber}>{val}</div>;
    const cellNotes = notes[r][c];
    if (cellNotes.size === 0) return null;
    const arr = Array.from({ length: 9 }, (_, i) =>
      cellNotes.has(i + 1) ? i + 1 : ""
    );
    return (
      <div style={styles.notesGrid}>
        {arr.map((n, idx) => (
          <div key={idx} style={styles.noteItem}>
            {n}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        {/* Left */}
        <div style={styles.left}>
          {/* Difficulty + Stats */}
          <div style={styles.topBar}>
            <div style={styles.difficultyRow}>
              <span style={styles.diffLabel}>Difficulty</span>
              <div style={styles.diffButtons}>
                {Object.keys(DIFFICULTY_REMOVALS).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    style={{
                      ...styles.diffButton,
                      ...(difficulty === lvl ? styles.diffButtonActive : {}),
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.statusRow}>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Score</div>
                <div style={styles.statValue}>{score}</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Mistakes</div>
                <div style={styles.statValue}>{mistakes}/3</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Time</div>
                <div style={styles.statValue}>
                  {formatTime(time)}{" "}
                  <button
                    onClick={() => setIsPaused((p) => !p)}
                    title={isPaused ? "Resume" : "Pause"}
                    style={styles.iconBtnSmall}
                  >
                    {isPaused ? <FaPlay /> : <FaPause />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Board */}
          <div style={styles.boardWrap}>
            <div style={styles.boardGrid}>
              {board.map((row, r) =>
                row.map((_, c) => {
                  const isFixed = fixed[r][c];
                  const isSelected =
                    selected && selected.r === r && selected.c === c;
                  const highlight =
                    selected &&
                    (selected.r === r ||
                      selected.c === c ||
                      (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
                        Math.floor(selected.c / 3) === Math.floor(c / 3)));

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => onSelectCell(r, c)}
                      style={{
                        ...styles.cell,
                        ...(isFixed ? styles.cellFixed : {}),
                        ...(isSelected ? styles.cellSelected : {}),
                        ...(highlight && !isSelected
                          ? styles.cellHighlight
                          : {}),
                        borderRight:
                          c % 3 === 2 ? "3px solid #2b6cb0" : "1px solid #cbd5e1",
                        borderBottom:
                          r % 3 === 2 ? "3px solid #2b6cb0" : "1px solid #cbd5e1",
                        borderLeft: c === 0 ? "3px solid #2b6cb0" : undefined,
                        borderTop: r === 0 ? "3px solid #2b6cb0" : undefined,
                      }}
                    >
                      {renderCellContent(r, c)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={styles.right}>
          <div style={styles.controlsRow}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              style={styles.circleBtn}
            >
              <FaUndo />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              style={styles.circleBtn}
            >
              <FaRedo />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={eraseCell}
              title="Eraser"
              style={styles.circleBtn}
            >
              <FaEraser />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotesMode((v) => !v)}
              title="Notes (toggle)"
              style={{
                ...styles.circleBtn,
                ...(notesMode ? styles.circleBtnActive : {}),
              }}
            >
              <FaRegStickyNote />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={hintFill}
              title="Hint"
              style={styles.circleBtn}
            >
              <FaLightbulb />
            </motion.button>
          </div>

          {/* Keypad */}
          <div style={styles.keypadWrap}>
            <div style={styles.keypadGrid}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  key={n}
                  onClick={() => placeNumber(n)}
                  style={styles.keyBtn}
                  title={`Place ${n}`}
                >
                  {n}
                </motion.button>
              ))}
            </div>

            <div style={styles.keypadActions}>
              <button
                onClick={() => {
                  if (!selected) return;
                  pushUndoState();
                  const { r, c } = selected;
                  const newNotes = cloneNotes(notes);
                  newNotes[r][c] = new Set();
                  setNotes(newNotes);
                }}
                style={styles.actionBtn}
              >
                Clear Notes
              </button>

              <button
                onClick={() => startNewGame(difficulty)}
                style={{
                  ...styles.actionBtn,
                  background: "#2563eb",
                  color: "#fff",
                }}
              >
                New Game
              </button>
            </div>
          </div>

          <div style={styles.help}>
            <div style={{ fontSize: 13, color: "#2d3748" }}>
              Tips: Tap a cell then use keypad or keyboard (1–9). Press "n" to
              toggle notes, "h" for hint, Backspace to erase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background: "#ebf8ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  app: {
    display: "flex",
    flexDirection: "row", // always side-by-side
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 20,
    width: "100%",
    maxWidth: 1200,
  },
  left: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  right: {
    flex: "0 0 250px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  topBar: {
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  difficultyRow: {
    marginBottom: 10,
  },
  diffLabel: { fontWeight: "bold", fontSize: 14, marginRight: 6 },
  diffButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  diffButton: {
    padding: "4px 8px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    cursor: "pointer",
  },
  diffButtonActive: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stat: { textAlign: "center" },
  statLabel: { fontSize: 12, color: "#4b5563" },
  statValue: { fontSize: 14, fontWeight: "bold" },
  iconBtnSmall: {
    marginLeft: 6,
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "2px 6px",
    cursor: "pointer",
  },
  boardWrap: {
    display: "flex",
    justifyContent: "center",
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    gridTemplateRows: "repeat(9, 1fr)",
    width: 450,
    height: 450,
    background: "#fff",
  },
  cell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    cursor: "pointer",
    background: "#fff",
  },
  cellFixed: { fontWeight: "bold", color: "#1e40af" },
  cellSelected: { background: "#bfdbfe" },
  cellHighlight: { background: "#e0f2fe" },
  cellNumber: { fontSize: 22 },
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
  controlsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  circleBtnActive: { background: "#2563eb", color: "#fff" },
  keypadWrap: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  keypadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  keyBtn: {
    padding: 14,
    fontSize: 18,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
  },
  keypadActions: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  actionBtn: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 14,
  },
  help: {
    fontSize: 12,
    color: "#475569",
  },
};
