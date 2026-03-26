import React, { useState } from "react";
import Calendar from "react-calendar";
import '../../styles/Calendar.css'; // adjust path if necessary


function TodaySchedule({ onViewDetails, detailPage }) {
  // Example appointments
  const appointments = [
    { id: "john", time: "09:00 AM", name: "John Doe", date: new Date(2025, 8, 8), details: "Checkup, Flu symptoms" },
    { id: "jane", time: "10:30 AM", name: "Jane Smith", date: new Date(2025, 8, 9), details: "Follow-up, Blood Test" },
    { id: "david", time: "11:15 AM", name: "David Lee", date: new Date(2025, 8, 10), details: "Consultation, Diabetes" },
  ];

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter appointments for the selected date
  const dailyAppointments = appointments.filter(
    (appt) =>
      appt.date.toDateString() === selectedDate.toDateString()
  );

  // Detail page view
  if (detailPage) {
    const appointment = appointments.find((a) => a.id === detailPage);
    if (!appointment) return <p>Details not found</p>;

    return (
      <div>
        <h3>{appointment.name}</h3>
        <p>Time: {appointment.time}</p>
        <p>Details: {appointment.details}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Today’s Schedule</h2>

      {/* Calendar */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => {
          const hasAppointment = appointments.some(
            (a) => a.date.toDateString() === date.toDateString()
          );
          return hasAppointment ? "appointment-day" : null;
        }}
      />

      {/* Appointments for selected date */}
      <h3 style={{ marginTop: "20px" }}>
        Appointments for {selectedDate.toDateString()}:
      </h3>
      <ul>
        {dailyAppointments.length > 0 ? (
          dailyAppointments.map((appt) => (
            <li
              key={appt.id}
              style={{ cursor: "pointer", marginBottom: "8px" }}
              onClick={() => onViewDetails(appt.id)}
            >
              {appt.time} – {appt.name}
            </li>
          ))
        ) : (
          <p>No appointments</p>
        )}
      </ul>
    </div>
  );
}

export default TodaySchedule;
