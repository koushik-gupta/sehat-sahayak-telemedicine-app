import React, { useState, useEffect, useRef } from 'react';
import './VideoComponent.css';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, FileText, Paperclip, Send,
    User, Minimize2, Maximize2
} from 'lucide-react';
import { buildWebSocketUrl } from '../utils/runtime';

const VideoComponent = ({ user, roomCode, onHangup }) => {
    const displayName = user.full_name || user.name || 'User';

    // --- Use useRef for the peer connection to prevent race conditions ---
    const peerConnectionRef = useRef(null);

    // State and other refs
    const [localStream, setLocalStream] = useState(null);
    const [dataChannel, setDataChannel] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [peerInfo, setPeerInfo] = useState({ name: 'Waiting for peer...' });
    const [isWaiting, setIsWaiting] = useState(true);
    const [isDoctor, setIsDoctor] = useState(user.role === 'doctor');
    const [showChat, setShowChat] = useState(false);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const chatInputRef = useRef();
    const uploadInputRef = useRef();
    const patientNameRef = useRef();
    const doctorNameRef = useRef();
    const prescriptionRef = useRef();

    useEffect(() => {
        // Use a simple local variable for the websocket; it's more stable during cleanup
        let ws = null;
        let streamInstance = null; // Keep a reference to the stream for cleanup

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamInstance = stream; // Assign to the outer scope variable
                setLocalStream(stream);
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                ws = new WebSocket(buildWebSocketUrl('/signal'));

                ws.onopen = () => {
                    console.log(`[${user.role}] WebSocket connected. Joining room: ${roomCode}`);
                    ws.send(JSON.stringify({ type: 'join_room', room_id: roomCode }));
                };

                // IMPORTANT: Pass the stream directly to the handler to avoid stale closures
                ws.onmessage = (event) => handleSignalingData(JSON.parse(event.data), ws, stream);

            } catch (error) {
                console.error("Error initializing media devices:", error);
                alert("Could not access camera/microphone. Please check permissions and refresh.");
            }
        };

        init();

        // This enhanced cleanup function will now correctly handle React Strict Mode
        return () => {
            console.log(`[${user.role}] Cleanup: Closing connections.`);

            if (ws) {
                ws.onclose = () => { }; // Disable onclose handler before closing to prevent errors
                ws.close();
            }

            if (streamInstance) {
                streamInstance.getTracks().forEach(track => track.stop());
            }

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };
    }, [roomCode]);

    const handleSignalingData = async (message, ws, stream) => {
        console.log(`[${user.role}] DEBUG: Received message of type ->`, message.type);
        switch (message.type) {
            case 'peer_joined':
                await createPeerConnection(ws, stream, true);
                break;
            case 'offer':
                await createPeerConnection(ws, stream, false);
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'stable') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    console.log(`[${user.role}] DEBUG: Handshake part 2 - Sending answer...`);
                    ws.send(JSON.stringify({ type: 'answer', answer, room_id: roomCode }));
                }
                break;
            case 'answer':
                if (peerConnectionRef.current?.signalingState === 'have-local-offer') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
                    console.log(`[${user.role}] DEBUG: Handshake complete! Connection established.`);
                }
                break;
            case 'candidate':
                if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
                break;
            case 'peer_left':
                alert("The other user has left the call.");
                onHangup();
                break;
        }
    };

    const createPeerConnection = async (ws, stream, isCaller) => {
        if (peerConnectionRef.current) {
            console.log(`[${user.role}] DEBUG: Peer connection already exists. Ignoring request.`);
            return;
        }
        console.log(`[${user.role}] DEBUG: Creating new PeerConnection. This user is the Caller: ${isCaller}`);
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        pc.ontrack = event => {
            console.log(`[${user.role}] DEBUG: Received remote track! Displaying video.`);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play().catch(error => {
                    console.error("Remote video play failed:", error);
                });
            }
            setIsWaiting(false);
        };

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        pc.onicecandidate = event => {
            if (event.candidate) ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, room_id: roomCode }));
        };
        if (isCaller) {
            setupDataChannel(pc.createDataChannel("chat"));
        } else {
            pc.ondatachannel = (event) => setupDataChannel(event.channel);
        }
        peerConnectionRef.current = pc;
        if (isCaller) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log(`[${user.role}] DEBUG: Handshake part 1 - Sending offer...`);
            ws.send(JSON.stringify({ type: 'offer', offer, room_id: roomCode }));
        }
    };

    const setupDataChannel = (dc) => {
        dc.onopen = () => {
            addMessageToChat('System', 'Chat connected!');
            dc.send(JSON.stringify({ type: 'user_info', name: displayName }));
        };
        dc.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'user_info') setPeerInfo({ name: msg.name });
            else if (msg.type === 'chat') addMessageToChat(peerInfo.name || 'Peer', msg.text);
        };
        setDataChannel(dc);
    };

    const addMessageToChat = (sender, text) => setChatMessages(prev => [...prev, { sender, text }]);
    const handleSendMessage = () => {
        const text = chatInputRef.current.value;
        if (text && dataChannel?.readyState === 'open') {
            dataChannel.send(JSON.stringify({ type: 'chat', text }));
            addMessageToChat('You', text);
            chatInputRef.current.value = '';
        }
    };

    const handleFileUpload = async () => {
        const file = uploadInputRef.current.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/v1/appointment/upload", { method: "POST", body: formData, credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'File upload failed');
            const fileHtml = `📎 <a href="${data.url}" target="_blank" class="text-blue-300 underline">${file.name}</a>`;
            if (dataChannel?.readyState === 'open') dataChannel.send(JSON.stringify({ type: 'chat', text: fileHtml }));
            addMessageToChat("You", fileHtml);
            uploadInputRef.current.value = "";
        } catch (error) {
            alert(`Upload failed: ${error.message}`);
        }
    };

    const handleSendPrescription = async () => {
        const patientName = patientNameRef.current.value.trim();
        const doctorName = doctorNameRef.current.value.trim();
        const presText = prescriptionRef.current.value.trim();
        if (!patientName || !doctorName || !presText) {
            alert("Please fill in all prescription fields.");
            return;
        }
        const formData = new FormData();
        formData.append("patient_name", patientName);
        formData.append("doctor_name", doctorName);
        formData.append("prescription", presText);
        try {
            const res = await fetch("/api/v1/appointment/generate_prescription", { method: "POST", body: formData, credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'PDF generation failed');
            const presHtml = `📝 <a href="${data.url}" target="_blank" class="text-blue-300 underline">Prescription for ${patientName}</a>`;
            if (dataChannel?.readyState === 'open') dataChannel.send(JSON.stringify({ type: 'chat', text: presHtml }));
            addMessageToChat("You", presHtml);
            prescriptionRef.current.value = "";
        } catch (error) {
            alert(`Failed to send prescription: ${error.message}`);
        }
    };

    const handleHangup = () => onHangup();
    const toggleMic = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMicMuted(prev => !prev);
    };
    const toggleVideo = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsVideoOff(prev => !prev);
    };

    return (
        <div className="modern-video-interface">
            {/* LEFT SIDE: Main Video Area (Flex Item 1) */}
            <div className="video-area">
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video"></video>

                {isWaiting && (
                    <div className="waiting-overlay">
                        <div className="spinner"></div>
                        <h3>Waiting for patient to join...</h3>
                    </div>
                )}

                <div className="peer-badge">
                    <User size={16} />
                    <span>{peerInfo.name}</span>
                </div>

                {/* Floating Local Video */}
                <div className="local-video-pip">
                    <video ref={localVideoRef} autoPlay playsInline muted className={`local-video ${isVideoOff ? 'hidden' : ''}`}></video>
                    <div className="local-badge">{displayName} (You)</div>
                </div>

                {/* Bottom Controls Bar */}
                <div className="controls-dock">
                    <button onClick={toggleMic} className={`control-btn ${isMicMuted ? 'active-red' : ''}`} title={isMicMuted ? "Unmute" : "Mute"}>
                        {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button onClick={toggleVideo} className={`control-btn ${isVideoOff ? 'active-red' : ''}`} title={isVideoOff ? "Start Video" : "Stop Video"}>
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>

                    <div className="separator"></div>

                    <button onClick={() => setShowChat(!showChat)} className={`control-btn ${showChat ? 'active-blue' : ''}`} title="Chat & Tools">
                        <MessageSquare size={20} />
                        {chatMessages.length > 0 && !showChat && <span className="badge-dot"></span>}
                    </button>

                    <input type="file" ref={uploadInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                    <button onClick={() => uploadInputRef.current.click()} className="control-btn" title="Share File">
                        <Paperclip size={20} />
                    </button>

                    <button onClick={handleHangup} className="control-btn hangup-btn" title="End Call">
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>

            {/* RIGHT SIDE: Sidebar Panel (Flex Item 2) */}
            <div className={`side-panel ${showChat ? 'open' : ''} ${isDoctor ? 'doctor-mode' : ''}`}>
                <div className="panel-header">
                    <h3>{isDoctor ? 'Consultation Tools' : 'In-Call Messages'}</h3>
                    <button onClick={() => setShowChat(false)} title="Close Sidebar"><Minimize2 size={18} /></button>
                </div>

                <div className="messages-area custom-scrollbar">
                    {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10 text-sm">
                            <p>No messages yet.</p>
                            <p>Use this space to chat or share files.</p>
                        </div>
                    )}
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                            <div className="msg-content" dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                            <span className="msg-sender">{msg.sender}</span>
                        </div>
                    ))}
                </div>

                <div className="input-area">
                    <input ref={chatInputRef} type="text" placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={handleSendMessage}><Send size={18} /></button>
                </div>

                {isDoctor && (
                    <div className="prescription-tools">
                        <h4><FileText size={16} /> Quick Prescription</h4>
                        <div className="presc-inputs">
                            <input ref={patientNameRef} type="text" placeholder="Patient Name" />
                            <input ref={doctorNameRef} defaultValue={displayName} type="text" placeholder="Doctor Name" readOnly />
                            <textarea ref={prescriptionRef} placeholder="Rx: Medicine Name (Dosage)&#10;Duration: 5 days&#10;Advice: Take after meals" rows="3"></textarea>
                            <button onClick={handleSendPrescription}>Generate & Send PDF</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoComponent;
