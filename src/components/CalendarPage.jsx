import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import bgImage from "../assets/tt.jpg";

const categories = [
  "All",
  "Work",
  "Personal",
  "Study",
  "Shopping",
  "Health",
  "Finance",
  "Travel",
  "Home",
  "Projects",
  "Events",
];

const ITEMS_PER_PAGE = 5;

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    category: "All",
    priority: "All",
    status: "All",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // ✅ Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://your-backend-api-rlbv.onrender.com/api/tasks",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  // ✅ Filter logic
  const filteredTasks = tasks.filter(
    (task) =>
      (filters.category === "All" || task.category === filters.category) &&
      (filters.priority === "All" || task.priority === filters.priority) &&
      (filters.status === "All" ||
        (filters.status === "Completed" ? task.completed : !task.completed))
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ✅ Priority color mapping
  const getPriorityColor = (priority, completed) => {
    if (completed) return "success";
    switch (priority) {
      case "High":
        return "danger";
      case "Medium":
        return "primary";
      case "Low":
        return "success";
      case "Urgent":
        return "dark";
      default:
        return "secondary";
    }
  };

  // ✅ Convert tasks to calendar events
  const events = filteredTasks.map((task) => ({
    id: task._id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    extendedProps: {
      priority: task.priority,
      completed: task.completed,
      category: task.category,
    },
  }));

  return (
    <div
      className="container-fluid py-5 login-bg"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      {/* === Custom CSS Styles === */}
      <style>{`
        /* === Header Styling === */
        .calendar-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          .calendar-header .exit-btn {
            align-self: flex-start;
            margin-bottom: 0.8rem;
          }
          .calendar-header .title-section {
            width: 100%;
            text-align: center;
          }
        }

        @media (min-width: 769px) {
          .calendar-header .exit-btn {
            position: absolute;
            top: 2rem;
            left: 2rem;
          }
          .calendar-header .title-section {
            margin-left: auto;
            text-align: right;
          }
        }

        .calendar-header h2 { 
          font-weight: 700; 
          font-size: 2rem; 
          background: linear-gradient(270deg, #00a2ffff, #f700f7ff, #00b3ffff, #0760efff, #1dfd00ff);
          background-size: 600% 600%; 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          animation: shine 6s ease infinite; 
        }
        .calendar-header p { 
          font-size: 1rem; 
          margin-top: 0.5rem; 
          color: #ffffffcc; 
        } 
        @keyframes shine { 
          0% { background-position: 0% 50%; } 
          50% { background-position: 100% 50%; } 
          100% { background-position: 0% 50%; } 
        }

        /* === Cards === */
        .task-list-card, .calendar-card { 
          background-color: rgba(255, 255, 255, 0); 
          border-radius: 1rem; 
          padding: 1.5rem; 
          border: 1px solid #ffffff; 
          box-shadow: none; 
          transition: all 0.3s ease; 
        } 
        .task-list-card:hover, .calendar-card:hover { 
          background-color: rgba(162, 55, 55, 0.03); 
        }

        /* === Task Item === */
        .task-item { 
          background: rgba(255, 255, 255, 0); 
          border-radius: 0.6rem; 
          border: 1px solid #ffffff; 
          color: #ffffff; 
          font-weight: 500; 
          margin-bottom: 0.6rem; 
          padding: 0.6rem; 
          transition: all 0.3s ease; 
        } 
        .task-item:hover { 
          transform: translateY(-1px); 
          background: rgba(255, 255, 255, 0.05); 
          border-color: #ffffff; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }

        /* === FullCalendar === */
        .fc { background-color: transparent !important; }

        .fc-toolbar {
          margin-bottom: 1rem !important;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
        }
        .fc-toolbar-title {
          font-size: 1.4rem !important;
          font-weight: 600 !important;
          color: #ffffff !important;
        }

        /* Buttons */
        .fc .fc-button {
          background-color: #0d6efd !important;
          border: none !important;
          border-radius: 6px !important;
          font-weight: 500;
          padding: 5px 12px !important;
          transition: all 0.3s ease;
        }
        .fc .fc-button:hover {
          background-color: #0b5ed7 !important;
        }

        /* Days of Week (Sun, Mon, Tue, etc.) */
        .fc-col-header {
          background-color: rgba(255, 255, 255, 0.07) !important;
          border-radius: 8px 8px 0 0;
        }
        .fc-col-header-cell {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          text-align: center !important;
        }
        .fc-col-header-cell-cushion {
         color: #000000 !important;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none !important;
        }

        /* Date Cells */
        .fc-daygrid-day {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          background-color: rgba(255, 255, 255, 0.02) !important;
          transition: background-color 0.3s ease;
        }
        .fc-daygrid-day:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        .fc-daygrid-day-number {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          margin: 0.25rem 0.4rem !important;
          text-decoration: none !important;
        }

        .fc-day-today {
          background-color: rgba(13, 202, 240, 0.1) !important;
          border: 1px solid #0dcaf0 !important;
        }

        .fc-daygrid-event {
          margin-top: 0.2rem !important;
          border-radius: 6px !important;
          padding: 2px 6px !important;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      {/* === Header === */}
      <div className="container position-relative">
        <div className="calendar-header">
          <button
            className="btn btn-outline-light px-3 py-2 exit-btn"
            style={{
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "500",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft /> Exit
          </button>

          <div className="title-section">
            <h2>📅 My Tasks Calendar</h2>
            <p className="fw-bolder">
              View all your tasks with deadlines and priorities
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* === Task List === */}
          <div className="col-12 col-md-5 col-lg-4">
            <div className="task-list-card">
              <h5 className="mb-3 text-white">Tasks</h5>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-3">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    bg={filters.category === cat ? "primary" : "secondary"}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setFilters({ ...filters, category: cat });
                      setCurrentPage(1);
                    }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="task-items">
                {paginatedTasks.length === 0 && (
                  <p className="text-muted text-center">No tasks found</p>
                )}
                {paginatedTasks.map((task) => (
                  <OverlayTrigger
                    key={task._id}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-${task._id}`}>
                        {`Category: ${task.category} | Deadline: ${new Date(
                          task.deadline
                        ).toLocaleDateString()}`}
                      </Tooltip>
                    }
                  >
                    <div className="task-item">
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                          <strong>{task.title}</strong>
                          <div className="mt-1">
                            <Badge
                              bg={getPriorityColor(
                                task.priority,
                                task.completed
                              )}
                              className="me-1"
                            >
                              {task.completed
                                ? `✅ ${task.priority}`
                                : task.priority}
                            </Badge>
                            <Badge bg="info" className="me-1">
                              {task.category}
                            </Badge>
                            <Badge bg={task.completed ? "success" : "warning"}>
                              {task.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        <small className="text-white fw-bolder">
                          {new Date(task.deadline).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </OverlayTrigger>
                ))}
              </div>

              {/* === Pagination === */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Prev
                  </button>
                  <span className="text-white fw-bolder">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* === Calendar === */}
          <div className="col-12 col-md-7 col-lg-8">
            <div className="calendar-card">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                dayHeaders={true}
                events={events}
                height="auto"
                eventContent={(arg) => (
                  <div className="fc-event-custom">
                    {arg.event.extendedProps.completed
                      ? `✅ ${arg.event.title}`
                      : arg.event.title}
                  </div>
                )}
                eventDidMount={(info) => {
                  const color = getPriorityColor(
                    info.event.extendedProps.priority,
                    info.event.extendedProps.completed
                  );
                  info.el.style.backgroundColor =
                    color === "success"
                      ? "#198754"
                      : color === "danger"
                      ? "#dc3545"
                      : color === "primary"
                      ? "#0d6efd"
                      : color === "dark"
                      ? "#343a40"
                      : "#6c757d";
                  info.el.style.color = "#fff";
                  info.el.style.borderColor = info.el.style.backgroundColor;
                }}
                eventClick={(info) => {
                  alert(
                    `📌 Task: ${info.event.title}\nPriority: ${
                      info.event.extendedProps.priority
                    }\nStatus: ${
                      info.event.extendedProps.completed
                        ? "✅ Completed"
                        : "⏳ Pending"
                    }\nCategory: ${info.event.extendedProps.category}`
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
