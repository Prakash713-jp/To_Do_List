// src/components/CalendarView.jsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // for selectable & drag-n-drop

const CalendarView = ({ tasks, onDateSelect }) => {
  const events = tasks.map((task) => ({
    id: task._id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    backgroundColor: task.completed ? "#198754" : "#ffc107",
    borderColor: task.completed ? "#198754" : "#ffc107",
  }));

  const handleDateClick = (info) => {
    if (onDateSelect) onDateSelect(info.dateStr);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={(info) => alert(`Task: ${info.event.title}`)}
        height="auto"
      />
    </div>
  );
};

export default CalendarView;
