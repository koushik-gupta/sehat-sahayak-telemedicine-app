# app/sockets.py

from flask_sock import Sock
import json

sock = Sock()
rooms = {} 

@sock.route('/signal')
def signal(ws):
    current_room = None
    current_ws = ws
    
    while True:
        try:
            data = ws.receive()
            if not data: continue
            
            message = json.loads(data)
            msg_type = message.get("type")
            room_id = message.get("room_id")

            if not room_id: continue

            if msg_type == "join_room":
                current_room = room_id
                if room_id not in rooms:
                    rooms[room_id] = []
                
                # --- THIS IS THE CRITICAL FIX ---
                # The logic is simplified to correctly assign a "caller" and "callee".
                
                # Add the new user to the room immediately.
                rooms[room_id].append(current_ws)
                print(f"User joined room '{room_id}'. Total users: {len(rooms[room_id])}")

                # If there are now exactly two people in the room, the handshake can begin.
                if len(rooms[room_id]) == 2:
                    # The first person who joined (at index 0) is designated as the caller.
                    # We send a "peer_joined" message ONLY to them.
                    first_peer_ws = rooms[room_id][0]
                    print(f"DEBUG: Notifying first peer in room '{room_id}' to start the call.")
                    try:
                        first_peer_ws.send(json.dumps({"type": "peer_joined"}))
                    except Exception as e:
                        print(f"Error sending 'peer_joined' to peer in room {room_id}: {e}")
                
            # Forward signaling messages (offer, answer, candidate) to the other peer in the room.
            elif msg_type in ("offer", "answer", "candidate"):
                if room_id in rooms:
                    for peer_ws in rooms[room_id]:
                        if peer_ws != current_ws:
                            try:
                                peer_ws.send(json.dumps(message))
                            except Exception as e:
                                print(f"Error forwarding message: {e}")
            
        except Exception as e:
            print(f"WebSocket Error or Disconnect for room '{current_room}': {e}")
            break

    # --- Cleanup on Disconnect ---
    if current_room and current_room in rooms:
        if current_ws in rooms[current_room]:
            rooms[current_room].remove(current_ws)
            print(f"User left room '{current_room}'. Remaining: {len(rooms[current_room])}")
            for peer_ws in rooms[current_room]:
                try:
                    peer_ws.send(json.dumps({"type": "peer_left"}))
                except Exception as e:
                    print(f"Error notifying remaining peer: {e}")
        if not rooms[current_room]:
            del rooms[current_room]
            print(f"Room '{current_room}' is empty and closed.")

