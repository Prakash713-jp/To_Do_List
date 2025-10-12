import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const categories = [
  "All", "Work", "Personal", "Study", "Shopping", "Health",
  "Finance", "Travel", "Home", "Projects", "Events",
];

const ITEMS_PER_PAGE = 5;

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ category: "All", priority: "All", status: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task =>
    (filters.category === "All" || task.category === filters.category) &&
    (filters.priority === "All" || task.priority === filters.priority) &&
    (filters.status === "All" || (filters.status === "Completed" ? task.completed : !task.completed))
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPriorityColor = (priority, completed) => {
    if (completed) return "success";
    switch (priority) {
      case "High": return "danger";
      case "Medium": return "primary";
      case "Low": return "success";
      case "Urgent": return "dark";
      default: return "secondary";
    }
  };

  const events = filteredTasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    extendedProps: {
      priority: task.priority,
      completed: task.completed,
      category: task.category
    },
  }));

  return (
    <div
      className="container-fluid py-5"
      style={{
         backgroundImage: `url('/tt.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
  <style>{`
  .calendar-header h2 { font-weight: 700; 
  font-size: 2rem; background: linear-gradient(270deg, #00a2ffff, #f700f7ff, #00b3ffff, #0760efff, #1dfd00ff);
   background-size: 600% 600%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shine 6s ease infinite; }
   
   .calendar-header p { font-size: 1rem; margin-top: 0.5rem; color: #ffffffcc; } @keyframes shine { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } 
   /* Task list & calendar container with white border */ .task-list-card, .calendar-card { background-color: rgba(255, 255, 255, 0); /* fully transparent */ border-radius: 1rem; padding: 1.5rem; border: 1px solid #ffffff; 
   /* white border */ box-shadow: none; transition: all 0.3s ease; } .task-list-card:hover, .calendar-card:hover { background-color: rgba(162, 55, 55, 0.03); /* subtle hover */ } /* Individual task items with white text and border */
    .task-item { background: rgba(255, 255, 255, 0); border-radius: 0.6rem; border: 1px solid #ffffff; color: #ffffff; /* white text */ font-weight: 500; margin-bottom: 0.6rem; padding: 0.6rem; transition: all 0.3s ease; } .task-item:hover { transform: translateY(-1px); background: rgba(255, 255, 255, 0.05); border-color: #ffffff; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } /* FullCalendar styling with white text and white borders */ .fc { background-color: transparent !important; } .fc-daygrid-day-frame { background-color: rgba(255, 255, 255, 0); border: 1px solid #ffffff; border-radius: 0.4rem; transition: background 0.3s ease; color: #ffffff; /* date text white */ } .fc-daygrid-day-frame:hover { background-color: rgba(255, 255, 255, 0.03); } /* Event boxes */ .fc-event-custom { border-radius: 0.5rem; font-weight: 600; padding: 4px 6px; color: #ffffff; /* white text */ font-size: 0.85rem; transition: all 0.3s ease; background-color: rgba(0,0,0,0); border: 1px solid #ffffff; } .fc-event-custom:hover { transform: scale(1.05); cursor: pointer; background-color: rgba(255, 255, 255, 0.05); color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } /* Today highlight */ .fc-day-today { background-color: rgba(26, 208, 114, 0.02) !important; } /* Toolbar styling */ .fc-toolbar-title { color: white; } /* Prev/Next buttons */ .fc-button { background-color: #3b82f6; /* blue filled */ color: white; border: none; transition: all 0.3s ease; } .fc-button:hover { background-color: #2563eb; /* darker blue on hover */ color: white; } /* Page numbers / navigation */ .fc-button-primary { background-color: #3b82f6; /* blue filled for page numbers if using fullcalendar nav */ color: white; border: none; } .fc-button-primary:hover { background-color: #2563eb; color: white; } @media(max-width: 992px) { .task-list-card, .calendar-card { margin-bottom: 2rem; } }

`}</style>




      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 calendar-header">
          <button
            className="btn btn-outline-light px-3 py-2"
            style={{ borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "500" }}
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft /> Exit
          </button>

          <div className="text-end w-40">
            <h2 className="text-center">📅 My Tasks Calendar</h2>
            <p className="text-center fw-bolder">View all your tasks with deadlines and priorities</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Task List */}
          <div className="col-12 col-lg-4">
            <div className="task-list-card">
              <h5 className="mb-3">Tasks</h5>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    bg={filters.category === cat ? "primary" : "secondary"}
                    style={{ cursor: "pointer" }}
                    onClick={() => { setFilters({ ...filters, category: cat }); setCurrentPage(1); }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="task-items">
                {paginatedTasks.length === 0 && <p className="text-muted">No tasks found</p>}
                {paginatedTasks.map(task => (
                  <OverlayTrigger
                    key={task._id}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-${task._id}`}>
                        {`Category: ${task.category} | Deadline: ${new Date(task.deadline).toLocaleDateString()}`}
                      </Tooltip>
                    }
                  >
                    <div className="task-item">
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                          <strong>{task.title}</strong>
                          <div className="mt-1">
                            <Badge bg={getPriorityColor(task.priority, task.completed)} className="me-1">
                              {task.completed ? `✅ ${task.priority}` : task.priority}
                            </Badge>
                            <Badge bg="info" className="me-1">{task.category}</Badge>
                            <Badge bg={task.completed ? "success" : "warning"}>
                              {task.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        <small className="text-white fw-bolder">{new Date(task.deadline).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </OverlayTrigger>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Prev
                  </button  >
                  <span className="text-white fw-bolder">Page {currentPage} of {totalPages}</span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Calendar View */}
          <div className="col-12 col-lg-8">
            <div className="calendar-card">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                height="auto"
                eventContent={arg => (
                  <div className="fc-event-custom">
                    {arg.event.extendedProps.completed ? `✅ ${arg.event.title}` : arg.event.title}
                  </div>
                )}
                eventDidMount={info => {
                  const color = getPriorityColor(info.event.extendedProps.priority, info.event.extendedProps.completed);
                  info.el.style.backgroundColor = color === "success" ? "#198754" :
                                                  color === "danger" ? "#dc3545" :
                                                  color === "primary" ? "#0d6efd" :
                                                  color === "dark" ? "#343a40" : "#6c757d";
                  info.el.style.color = "#fff";
                  info.el.style.borderColor = info.el.style.backgroundColor;
                  info.el.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

                  info.el.addEventListener("mouseenter", () => info.el.style.transform = "scale(1.05)");
                  info.el.addEventListener("mouseleave", () => info.el.style.transform = "scale(1)");
                }}
                eventClick={info => {
                  alert(
                    `Task: ${info.event.title}\nPriority: ${info.event.extendedProps.priority}\nCompleted: ${info.event.extendedProps.completed ? "✅" : "⏳"}`
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
