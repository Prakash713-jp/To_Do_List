// src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import TaskList from "../components/TaskList";
import { Navigate } from "react-router-dom";
import {
  FaRocket,
  FaListAlt,
  FaFire,
  FaLightbulb,
  FaSmile,
  FaChartPie,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Sudoku from "../pages/Sudoku"; // adjust path if different


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#FF6384"];
const STATUS_COLORS = { Completed: "#28a745", Pending: "#ffc107", Overdue: "#dc3545" };

const motionCard = {
  hidden: { opacity: 0, y: 8, scale: 0.99 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.25 } },
};

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const Dashboard = () => {
  const { user, tasks } = useContext(AuthContext);
  const [activeWidget, setActiveWidget] = useState("tasks");
  const [menuOpen, setMenuOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedMood, setSelectedMood] = useState(null);
    const [sparkTrigger, setSparkTrigger] = useState(0);

  if (!user) return <Navigate to="/login" />;

  // Task Category Pie Data
  const categoryData = useMemo(() => {
    if (!tasks || !tasks.length) return [];
    const categories = {};
    tasks.forEach((t) => {
      const cat = t.category?.trim() || "Uncategorized";
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // All categories for tooltip
  const allCategories = useMemo(() => {
    if (!tasks) return [];
    const set = new Set();
    tasks.forEach((t) => set.add(t.category?.trim() || "Uncategorized"));
    return Array.from(set);
  }, [tasks]);

  // Task Status Numbers
  const taskStatusData = useMemo(() => {
    if (!tasks || !tasks.length) return [];
    const now = new Date();
    let Completed = 0, Pending = 0, Overdue = 0;

    tasks.forEach((t) => {
      if (t.completed) Completed++;
      else {
        const due = t.dueDate ? new Date(t.dueDate) : null;
        if (due && due < now) Overdue++;
        else Pending++;
      }
    });

    return [
      { label: "Completed", value: Completed, color: STATUS_COLORS.Completed },
      { label: "Pending", value: Pending, color: STATUS_COLORS.Pending },
      { label: "Overdue", value: Overdue, color: STATUS_COLORS.Overdue },
    ];
  }, [tasks]);

  // Completed count
  useEffect(() => {
    setCompletedTasks(tasks?.filter((t) => t.completed).length || 0);
  }, [tasks]);

  // Monthly Bar Chart Data
  const monthlyData = useMemo(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      Completed: 0,
      Pending: 0,
      Overdue: 0,
      categories: {},
      label: `${i + 1}`,
    }));

    tasks?.forEach((t) => {
      const dateStr = t.dueDate || t.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const idx = d.getDate() - 1;
        const cat = t.category?.trim() || "Uncategorized";
        if (!arr[idx].categories[cat]) arr[idx].categories[cat] = { Completed: 0, Pending: 0, Overdue: 0 };

        if (t.completed) {
          arr[idx].Completed += 1;
          arr[idx].categories[cat].Completed += 1;
        } else {
          const now = new Date();
          const due = t.dueDate ? new Date(t.dueDate) : null;
          if (due && due < now) {
            arr[idx].Overdue += 1;
            arr[idx].categories[cat].Overdue += 1;
          } else {
            arr[idx].Pending += 1;
            arr[idx].categories[cat].Pending += 1;
          }
        }
      }
    });

    return arr;
  }, [tasks, selectedMonth]);

  const monthLabel = selectedMonth.toLocaleString(undefined, { month: "long", year: "numeric" });

  // Custom Tooltip for Bar Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dayData = monthlyData.find((d) => d.label === label);
      return (
        <div className="card p-2 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h6>Day {label} ({selectedMonth.getFullYear()})</h6>
          {allCategories.map((cat, idx) => {
            const data = dayData.categories[cat] || { Completed: 0, Pending: 0, Overdue: 0 };
            return (
              <div key={idx} className="mb-1">
                <strong>{cat}</strong>: Completed: {data.Completed}, Pending: {data.Pending}, Overdue: {data.Overdue}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "80vh" }}>
      {/* Floating Rocket Menu */}
      <div
        style={{ position: "fixed", top: "50%", left: "15px", transform: "translateY(-50%)", zIndex: 1100 }}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <motion.button
          className="btn btn-primary rounded-circle shadow"
          style={{ width: "55px", height: "55px" }}
          animate={{ rotate: menuOpen ? 20 : 0, scale: menuOpen ? 1.03 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          onClick={() => setMenuOpen((s) => !s)}
        >
          <FaRocket size={22} />
        </motion.button>

        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "160px", height: "160px" }}>
          {[ 
            { icon: <FaListAlt size={18} />, key: "tasks" },
            { icon: <FaFire size={18} />, key: "streak" },
            { icon: <FaLightbulb size={18} />, key: "insights" },
            { icon: <FaSmile size={18} />, key: "mood" },
            { icon: <FaChartPie size={18} />, key: "pie" },
             { icon: <FaRocket size={18} />, key: "sudoku" }, 
          ].map(({ icon, key }, i, items) => {
            const angle = (i / (items.length - 1)) * Math.PI;
            const radius = 72;
            const y = -Math.cos(angle) * radius;
            const offsetX = Math.sin(angle) * radius;

            return (
              <motion.button
                key={key}
                className={`btn btn-light rounded-circle shadow position-absolute ${menuOpen ? "" : "invisible"}`}
                style={{ left: `${50 + offsetX}px`, top: `${50 + y}px`, width: "42px", height: "42px" }}
                animate={{ opacity: menuOpen ? 1 : 0, scale: menuOpen ? 1 : 0.6 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 260 }}
                onClick={() => { setActiveWidget(key); setMenuOpen(false); }}
              >
                {icon}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Widgets */}
      <div className="flex-grow-1 p-3">
        <AnimatePresence mode="wait">
          {activeWidget === "tasks" && (
            <motion.div key="tasks" variants={motionCard} initial="hidden" animate="enter" exit="exit">
              <TaskList />
            </motion.div>
          )}

   {activeWidget === "streak" && (
  <motion.div 
    key="streak" 
    variants={motionCard} 
    initial="hidden" 
    animate="enter" 
    exit="exit"
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "80vh" }}
  >
    <motion.div 
      className="card shadow-lg text-center p-4 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
        color: "#fff",
        borderRadius: "20px",
        width: "75vw",
        maxWidth: "900px",
        minHeight: "450px",
        padding: "2.5rem",
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
    >
      {/* Animated Emojis */}
      {["🔥", "💥", "✨", "🎉", "💪"].map((emoji, idx) => (
        <motion.div
          key={idx}
          className="position-absolute"
          style={{ top: `${-5 + idx * 5}%`, left: `${20 + idx * 15}%`, fontSize: "2.5rem" }}
          animate={{ y: [0, 20, 0], rotate: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 2 + idx * 0.5, ease: "easeInOut" }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Heading */}
      <motion.h2
        className="mb-3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        🌟 Your Streaks 🌟
      </motion.h2>

      {/* Month Navigation */}
      <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">
        <button
          className="btn btn-sm btn-outline-light me-2 mb-2"
          onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
        >
          Prev Month
        </button>
        <h5 className="mb-0 mx-2">{selectedMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}</h5>
        <button
          className="btn btn-sm btn-outline-light ms-2 mb-2"
          onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
        >
          Next Month
        </button>
      </div>

      {/* Daily Streaks */}
      <div className="mb-4">
        <h5>Daily Streak</h5>
        <div className="d-flex justify-content-between flex-wrap">
          {monthlyData.map((day) => (
            <div key={day.day} className="text-center m-1" style={{ minWidth: "30px" }}>
              <div
                className="rounded-pill mb-1"
                style={{
                  height: "20px",
                  background: day.Completed > 0 
                    ? "linear-gradient(90deg, #FFD700, #FF4500)" 
                    : "rgba(255,255,255,0.3)",
                  width: "100%",
                  transition: "all 0.5s ease",
                }}
                title={`Day ${day.day} - Completed: ${day.Completed}`}
              ></div>
              <small>{day.day}</small>
              <div style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                {day.Completed}/{day.Completed + day.Pending + day.Overdue}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Streak */}
      <div>
        <h5>Monthly Streak</h5>
        <div className="progress" style={{ height: "25px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.2)" }}>
          <motion.div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${(completedTasks / (tasks.length || 1)) * 100}%`,
              background: "linear-gradient(90deg, #FFD700, #FF4500)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(completedTasks / (tasks.length || 1)) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            aria-valuenow={completedTasks}
            aria-valuemin="0"
            aria-valuemax={tasks.length || 1}
          />
        </div>
        <p className="mt-2">{completedTasks} / {tasks.length || 0} Tasks Completed This Month</p>
      </div>
    </motion.div>
  </motion.div>
)}




          {activeWidget === "pie" && (
            <motion.div key="pie" variants={motionCard} initial="hidden" animate="enter" exit="exit">
              {/* Pie Chart */}
              <div className="card shadow-sm p-4 mb-3" style={{ minHeight: "420px" }}>
                <h5><FaChartPie /> Task Categories</h5>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label={(entry) => `${entry.name} (${entry.value})`}
                      >
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center mt-5">No tasks available</p>
                )}
              </div>

              {/* Task Status Numbers */}
              <div className="card shadow-sm p-4 mb-3">
                <h5>Task Status Overview</h5>
                {taskStatusData.map((item, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="progress" style={{ height: "12px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${(item.value / (tasks.length || 1)) * 100}%`, backgroundColor: item.color }}
                        aria-valuenow={item.value}
                        aria-valuemin="0"
                        aria-valuemax={tasks.length || 1}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Bar Chart */}
              <div className="card shadow-sm p-4">
                <h5><FaCalendarAlt /> Monthly Task Overview ({monthLabel})</h5>

                {/* Year and Month Buttons */}
                <div className="d-flex flex-wrap mb-3 align-items-center">
                  <button className="btn btn-sm me-2 mb-2" onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear() -1, selectedMonth.getMonth(), 1))}>Prev Year</button>
                  <button className="btn btn-sm me-2 mb-2" onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear() +1, selectedMonth.getMonth(), 1))}>Next Year</button>
                  {months.map((m, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm me-2 mb-2 ${selectedMonth.getMonth() === i ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), i, 1))}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Completed" stackId="a" fill={STATUS_COLORS.Completed} />
                      <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.Pending} />
                      <Bar dataKey="Overdue" stackId="a" fill={STATUS_COLORS.Overdue} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center mt-3">No tasks available for this month</p>
                )}
              </div>
            </motion.div>
          )}
             {/* Insights Widget */}
      {activeWidget === "insights" && (
        <motion.div
          key="insights"
          variants={motionCard}
          initial="hidden"
          animate="enter"
          exit="exit"
          className="d-flex justify-content-center"
        >
          <motion.div
            className="card shadow-lg p-4 position-relative overflow-hidden"
            style={{
              minHeight: "500px",
              width: "75vw",
              maxWidth: "900px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "#fff",
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
          >
            {/* Floating sparkles */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="position-absolute rounded-circle"
                style={{
                  width: `${15 + i * 10}px`,
                  height: `${15 + i * 10}px`,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  top: `${5 + i * 12}%`,
                  left: `${10 + i * 15}%`,
                }}
                animate={{ y: [0, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 4 + i }}
              />
            ))}

            {/* Heading */}
            <motion.h2
              className="mb-4 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              🤖 AI Insights
            </motion.h2>

            {/* Insights Stats Grid */}
            <div className="d-flex flex-column flex-md-row justify-content-around align-items-center gap-3">
              {/* Top Categories */}
              <motion.div
  className="card text-center shadow-sm p-3"
  style={{
    flex: 1,
    borderRadius: "15px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // makes spacing even
  }}
  whileHover={{ scale: 1.05, rotate: 1 }}
  transition={{ type: "spring", stiffness: 150 }}
>
  <h5>🔥 Top Categories</h5>
  <div className="mt-2">
    {categoryData.slice(0, 3).map((c, idx) => (
      <span
        key={idx}
        className="badge me-1 mt-1"
        style={{
          background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, #00ccff)`,
          color: "#fff",
          fontSize: "0.9rem",
        }}
      >
        {c.name} ({c.value})
      </span>
    ))}
    {categoryData.length === 0 && <p className="mt-2">No categories yet</p>}
  </div>

  {/* Spacer to match size with other cards */}
  <div style={{ height: "40px" }}></div>
</motion.div>


              {/* Task Completion */}
              <motion.div
                className="card text-center shadow-sm p-3"
                style={{
                  flex: 1,
                  borderRadius: "15px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                <h5>✅ Completion</h5>
                <p className="display-6 fw-bold">{completedTasks}</p>
                <div
                  className="progress mt-2"
                  style={{ height: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.3)" }}
                >
                  <motion.div
                    className="progress-bar"
                    style={{
                      width: `${(completedTasks / (tasks.length || 1)) * 100}%`,
                      background: "linear-gradient(90deg, #00ff99, #00ccff)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTasks / (tasks.length || 1)) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <small>{((completedTasks / (tasks.length || 1)) * 100).toFixed(1)}% completed</small>
              </motion.div>

              {/* Pending Tasks */}
              <motion.div
                className="card text-center shadow-sm p-3"
                style={{
                  flex: 1,
                  borderRadius: "15px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                <h5>⏳ Pending</h5>
                <p className="display-6 fw-bold">
                  {taskStatusData.find((t) => t.label === "Pending")?.value || 0}
                </p>
                <div
                  className="progress mt-2"
                  style={{ height: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.3)" }}
                >
                  <motion.div
                    className="progress-bar"
                    style={{
                      width: `${((taskStatusData.find((t) => t.label === "Pending")?.value || 0) /
                        (tasks.length || 1)) *
                        100}%`,
                      background: "#ffcc00",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((taskStatusData.find((t) => t.label === "Pending")?.value || 0) /
                        (tasks.length || 1)) *
                        100}%`,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <small>
                  {(
                    ((taskStatusData.find((t) => t.label === "Pending")?.value || 0) /
                      (tasks.length || 1)) *
                    100
                  ).toFixed(1)}
                  % pending
                </small>
              </motion.div>
            </div>

            {/* Fun Motivational Message */}
            <motion.div
              className="mt-5 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <h5>🚀 Keep pushing! Your productivity streak is strong 💪</h5>
              <p>Top categories and completion stats are your roadmap to success.</p>
            </motion.div>
          </motion.div>
        </motion.div>
)}

{activeWidget === "sudoku" && (
  <motion.div
    key="sudoku"
    variants={motionCard}
    initial="hidden"
    animate="enter"
    exit="exit"
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "80vh" }}
  >
    <div className="card shadow-lg p-4" style={{ borderRadius: "20px", width: "90%", maxWidth: "800px" }}>
      <h3 className="mb-3 text-center">🧩 Sudoku</h3>
      <Sudoku />
    </div>
  </motion.div>
)}



          {/* Mood Widget */}
     { activeWidget === "mood" && (
      <motion.div
        key="mood"
        variants={motionCard}
        initial="hidden"
        animate="enter"
        exit="exit"
      >
        <motion.div
          className="card shadow-lg p-4 text-center"
          style={{
            minHeight: "450px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
            color: "#fff",
            overflow: "hidden",
            position: "relative",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Subtle animated background glow */}
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15), transparent 60%)",
              zIndex: 0,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 className="fw-bold">😊 Mood Tracker</h2>
            <p className="mt-3 text-light">
              Log your daily mood and visualize emotional trends.
            </p>

            {/* Emoji Buttons */}
            <div className="d-flex flex-wrap justify-content-center align-items-center mt-4">
              {[
                "😄",
                "😃",
                "🙂",
                "😐",
                "😕",
                "😔",
                "😢",
                "😠",
                "😰",
                "🥳",
                "😴",
                "🤯",
              ].map((emoji, idx) => (
                <motion.div
                  key={idx}
                  className="position-relative m-2"
                  style={{ width: "70px", height: "70px" }}
                >
                  <motion.button
                    className="btn shadow-sm position-relative"
                    style={{
                      fontSize: "2rem",
                      borderRadius: "50%",
                      width: "70px",
                      height: "70px",
                      background:
                        selectedMood === emoji
                          ? "rgba(255,255,255,0.35)"
                          : "rgba(255,255,255,0.15)",
                      border: selectedMood === emoji
                        ? "2px solid #fff"
                        : "none",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        selectedMood === emoji
                          ? "0 0 12px rgba(255,255,255,0.8)"
                          : "none",
                      zIndex: 1,
                    }}
                    onClick={() => {
                      setSelectedMood(emoji);
                      setSparkTrigger((prev) => prev + 1);
                    }}
                    whileHover={{
                      scale: 1.2,
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      selectedMood === emoji ? { scale: [1, 1.2, 1] } : {}
                    }
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                  >
                    {emoji}
                  </motion.button>

                  {/* Spark Animation */}
                  {selectedMood === emoji && (
                    <motion.div
                      key={sparkTrigger}
                      initial={{ opacity: 1, scale: 0 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.6)",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Animated footer text */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <small className="text-light">
                {selectedMood
                  ? `You selected ${selectedMood}. Great choice!`
                  : "Select your mood to start tracking today’s journey 🚀"}
              </small>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
)};


        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
