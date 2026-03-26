// src/pages/Dashboard/Consultation/InCallScreen.jsx

import React from 'react';
import VideoComponent from '../../../components/VideoComponent';
import styles from './InCallScreen.module.css';

const InCallScreen = ({ user, appointment, onEndCall, t }) => {
  // This safety check prevents the "stuck on loading" screen.
  if (!appointment || !user) {
    return (
        <div className={styles.inCallScreen}>
            <div className="p-8 text-center text-white">
                <h2 className="text-2xl font-bold">Loading Call...</h2>
                <p>If this screen persists, please go back and try joining again.</p>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.inCallScreen}>
      <VideoComponent 
        user={{ name: user.full_name, role: user.role }}
        roomCode={appointment.video_room_code}
        onHangup={onEndCall}
      />
    </div>
  );
};

export default InCallScreen;