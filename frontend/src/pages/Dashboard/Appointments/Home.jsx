import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Welcome to Sehat Nabha</h1>
      <p>Your health, our priority.</p>
      <div className={styles.links}>
        <Link to="/doctors" className={styles.btn}>Find Doctors</Link>
        <Link to="/appointments" className={styles.btn}>My Appointments</Link>
      </div>
    </div>
  );
};

export default Home;
