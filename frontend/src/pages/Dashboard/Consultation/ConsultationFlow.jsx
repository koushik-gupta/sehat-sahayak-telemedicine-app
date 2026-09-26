// src/pages/Dashboard/Consultation/ConsultationFlow.jsx

import React, { useState } from 'react';

import MyConsultationsScreen from './MyConsultationsScreen';
import PreCallScreen from './PreCallScreen';
import InCallScreen from './InCallScreen';
import PostCallScreen from './PostCallScreen';

const ConsultationFlow = ({ user, onBack, t }) => {
    const [stage, setStage] = useState('list'); // list, pre_call, in_call, post_call
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const handleSelectAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setStage('pre_call');
    };

    const handleStartCall = () => {
        setStage('in_call');
    };

    const handleEndCall = async () => {
    try {
        const response = await fetch(
            `/api/v1/appointment/${selectedAppointment.id}/complete`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to complete appointment.");
        }

        setStage("post_call");
    } catch (error) {
        console.error("Failed to complete appointment:", error);
        alert(error.message || "Failed to complete appointment.");
    }
};

    const handleDone = () => {
        // Go back to the list, which will re-fetch and show the updated status
        setSelectedAppointment(null);
        setStage('list');
    };

    switch (stage) {
        case 'pre_call':
            return (
                <PreCallScreen
                    appointment={selectedAppointment}
                    onStartCall={handleStartCall}
                    onBack={handleDone} // Go back to the list
                    t={t}
                />
            );
        case 'in_call':
            return (
                <InCallScreen
                    user={user}
                    appointment={selectedAppointment}
                    onEndCall={handleEndCall}
                    t={t}
                />
            );
        case 'post_call':
            return (
                 <PostCallScreen
                    onDone={handleDone}
                    t={t}
                />
            );
        case 'list':
        default:
            return (
                <MyConsultationsScreen
                    onSelectAppointment={handleSelectAppointment}
                    onBack={onBack}
                    t={t}
                />
            );
    }
};

export default ConsultationFlow;