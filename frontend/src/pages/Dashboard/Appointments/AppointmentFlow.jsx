import React, { useState, useEffect } from 'react';
import AppointmentNav from './AppointmentNav';
import Doctors from './Doctors';
import DoctorProfile from './DoctorProfile';
import Appointments from './Appointments';
import Contact from './Contact';

export default function AppointmentFlow({ user, t, onBack, initialSearchQuery }) {
  const [view, setView] = useState('list');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        // --- THIS IS THE FIX ---
        // The URL is now pointed to the correct, newly created API endpoint.
        const response = await fetch('/api/v1/doctor/list', { credentials: 'include' });

        if (!response.ok) throw new Error('Failed to fetch doctors list.');
        const data = await response.json();

        console.log("AppointmentFlow: Fetched doctors successfully from backend:", data);
        setDoctorsList(data);
      } catch (error) {
        console.error("AppointmentFlow: Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSelectDoctor = (doctorId) => {
    console.log(`AppointmentFlow: User selected doctor ID: ${doctorId}. Switching to profile view.`);
    setSelectedDoctorId(doctorId);
    setView('profile');
  };

  const handleBackToList = () => {
    setSelectedDoctorId(null);
    setView('list');
  };

  const handleBookAppointment = async (bookingDetails) => {
    try {
      const response = await fetch('/api/v1/appointment/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingDetails),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Booking failed');
      alert(`Appointment Confirmed! A notification has been sent.`);
      setView('my_appointments');
    } catch (error) {
      alert(`Booking Error: ${error.message}`);
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="p-8 text-center">Loading available doctors...</div>;

    switch (view) {
      case 'profile':
        return (
          <DoctorProfile
            doctors={doctorsList}
            doctorId={selectedDoctorId}
            onBack={handleBackToList}
            onBookAppointment={handleBookAppointment}
            t={t}
          />
        );
      case 'my_appointments':
        return <Appointments user={user} t={t} />;
      case 'contact':
        return <Contact t={t} />;
      case 'list':
      default:
        return (
          <Doctors
            doctors={doctorsList}
            onSelectDoctor={handleSelectDoctor}
            onBack={onBack}
            t={t}
            initialSearchQuery={initialSearchQuery}
          />
        );
    }
  };

  return (
    <div className="appointment-flow-container">
      <AppointmentNav currentView={view} setView={setView} t={t} />
      <div className="appointment-content">{renderContent()}</div>
    </div>
  );
}
