import React, { useState } from "react";
import DoctorCard from "../components/DoctorCard";
import styles from "./DoctorsList.module.css";

const doctors = [
  {
    id: 1,
    name: "Dr. Arora",
    specialization: "Orthopedic",
    experience: "10 years",
    qualification: "MBBS, MS (Ortho)",
    hospital: "Nabha Hospital",
    price: "₹500",
    img: "/images/doc1.png",
  },
  {
    id: 2,
    name: "Dr. Sharma",
    specialization: "Cardiologist",
    experience: "15 years",
    qualification: "MBBS, DM (Cardiology)",
    hospital: "Apollo Patiala",
    price: "₹800",
    img: "/images/doc2.png",
  },
  {
    id: 3,
    name: "Dr. Gupta",
    specialization: "Pediatrician",
    experience: "8 years",
    qualification: "MBBS, MD (Pediatrics)",
    hospital: "CMC Ludhiana",
    price: "₹600",
    img: "/images/doc3.png",
  },
];

// Extract unique specializations dynamically
const specializations = ["All", ...new Set(doctors.map((doc) => doc.specialization))];

const DoctorsList = () => {
  const [filter, setFilter] = useState("All");

  const filteredDoctors =
    filter === "All" ? doctors : doctors.filter((doc) => doc.specialization === filter);

  return (
    <div className={styles.container}>
      <h2>Available Doctors</h2>

      <div className={styles.filter}>
        <label>Select Category: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {specializations.map((spec, i) => (
            <option key={i} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
