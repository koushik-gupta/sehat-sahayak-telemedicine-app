// src/pages/Dashboard/Appointments/DoctorProfile.jsx

import React from 'react';
import BackButton from '../../../components/BackButton';
import { ShieldCheck, Video, MapPin, Clock, Award, Star, Calendar } from 'lucide-react';

const DoctorProfile = ({ doctors, doctorId, onBack, onBookAppointment, t }) => {
  const doctor = doctors.find((d) => String(d.id) === String(doctorId));

  const handleInstantBooking = () => {
    // We only need to send the doctor's ID. The backend handles the time.
    onBookAppointment({ doctorId: doctor.id });
  };

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <h2 className="text-xl font-bold">Doctor Not Found</h2>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animation-fade-in pb-20">
      <div className="mb-6">
        <BackButton onClick={onBack} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden text-center sticky top-6">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500 to-indigo-600"></div>

            <div className="relative z-10 -mt-0 mb-4 inline-block">
              <div className="w-40 h-40 mx-auto rounded-2xl border-4 border-white shadow-lg bg-white overflow-hidden p-1">
                <img
                  src={doctor.image || '/images/doc1.png'}
                  alt={doctor.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=doc_placeholder" }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">{doctor.name}</h2>
            <p className="text-blue-600 font-medium mb-4">{doctor.specialty || 'Specialist'}</p>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6 bg-slate-50 py-2 rounded-xl">
              <MapPin size={16} /> New York Medical Center
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-xs text-blue-600 font-bold uppercase">Experience</p>
                <p className="text-lg font-bold text-slate-800">12+ <span className="text-xs font-medium text-slate-500">Yrs</span></p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold uppercase">Patients</p>
                <p className="text-lg font-bold text-slate-800">2.5k <span className="text-xs font-medium text-slate-500">+</span></p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-bold text-slate-800 text-lg">{doctor.fee || '$50'}</span>
              </div>
              <button
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                onClick={handleInstantBooking}
              >
                <Video size={18} /> Book Instant Call
              </button>
              <p className="text-xs text-slate-400 mt-2">Usually replies within 5 mins</p>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={24} /> About Doctor
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Dr. {doctor.name.split(' ')[1] || doctor.name} is a highly skilled {doctor.specialty} with over 15 years of experience in treating complex medical conditions.
              Dedicated to providing patient-centered care with a focus on holistic treatment plans.
              <br /><br />
              Member of the American Medical Association and recipient of the "Best Doctor" award for three consecutive years.
              Specializes in preventative care and chronic disease management.
            </p>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-indigo-500" size={24} /> Availability
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <p className="text-sm font-medium text-slate-500 mb-1">{day}</p>
                  <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-block group-hover:bg-white">Available</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Preview (Static for now) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={24} /> Patient Reviews
              </h3>
              <span className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg">4.9 / 5.0</span>
            </div>

            <div className="space-y-4">
              <ReviewItem
                name="John Doe"
                rating={5}
                text="Dr. {doctor.name} was incredibly attentive and explained everything clearly. Highly recommended!"
                date="2 days ago"
              />
              <ReviewItem
                name="Sarah Smith"
                rating={5}
                text="Very professional and kind. The video call was stable and clear."
                date="1 week ago"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewItem = ({ name, rating, text, date }) => (
  <div className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <div className="flex gap-0.5">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>
      </div>
      <span className="text-xs text-slate-400">{date}</span>
    </div>
    <p className="text-sm text-slate-500 pl-10 leading-relaxed">{text}</p>
  </div>
);

export default DoctorProfile;