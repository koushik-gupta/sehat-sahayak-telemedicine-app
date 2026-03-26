// src/pages/Contact.jsx
import React from "react";
import styles from "./Contact.module.css";

function Contact() {
  return (
    <div className={styles.container}>
      <h2>Contact Us</h2>
      <p><b>Email:</b> support@sehatnabha.in</p>
      <p><b>Phone:</b> +91 98765 43210</p>
      <p><b>Address:</b> Sehat Nabha Clinic, Nabha, Punjab, India</p>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;