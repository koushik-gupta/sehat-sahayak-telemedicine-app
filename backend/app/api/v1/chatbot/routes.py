# backend/app/api/v1/chatbot/routes.py

import os
import json
from flask import Blueprint, request, jsonify, session
from groq import Groq
from .tools import AVAILABLE_TOOLS, TOOL_DEFINITIONS

chatbot_bp = Blueprint('chatbot_v1', __name__, url_prefix='/api/v1/chatbot')

# --- Groq API Configuration ---
# Ideally this should be in .env as GROQ_API_KEY
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables.")
MODEL_NAME = "llama-3.1-8b-instant"

try:
    client = Groq(api_key=GROQ_API_KEY)
    print(f"SUCCESS: Groq API configured with model {MODEL_NAME}.")
except Exception as e:
    print(f"FATAL ERROR: Could not configure Groq API. {e}")
    client = None

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    # Authentication check
    # Note: We enforce login for access to personalized health info
    # if 'user_id' not in session:
    #    return jsonify({"error": "Authentication required. Please log in."}), 401

    if client is None:
        return jsonify({"error": "AI Model is not initialized."}), 503

    data = request.json
    user_message = data.get('message')
    language = data.get('language', 'English')
    history = data.get('history', [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # --- System Instruction ---
    system_instruction = f"""You are 'SwasthyaSetu Sahayak', an empathetic, clear, and safe AI health assistant.
    
    CORE IDENTIY:
    - You are an AI, NOT a doctor.
    - You help getting health information and finding medical services.
    
    RULES:
    1. LANGUAGE: Respond in {language} ONLY.
    2. SCOPE: Answer ONLY health symptoms, first-aid, medicines, and doctor searches. Refuse other topics politely.
    3. TOOLS: You have access to a database of 'Verified Doctors' and 'Medicine Stocks'.
       - If user asks for a doctor/specialist, USE `find_doctors`.
       - If user asks for a medicine availability, USE `find_medicines`.
    4. SAFETY: ALWAYS add this disclaimer at the end of medical advice: "Disclaimer: I am an AI. Consult a real doctor for serious issues."
    5. DATA: When presenting tool results (doctors/medicines), format them clearly in a list.
    """

    # Prepare messages for Groq
    messages = [{"role": "system", "content": system_instruction}]
    
    # Add history
    for msg in history:
        if msg.get('text'):
            role = 'user' if msg.get('from') == 'user' else 'assistant'
            messages.append({"role": role, "content": msg['text']})
            
    # Add current user message
    messages.append({"role": "user", "content": user_message})

    try:
        # First Call: Check for Tool Use
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            max_tokens=1024
        )

        response_message = completion.choices[0].message
        tool_calls = response_message.tool_calls

        # Step 2: Handle Tool Calls
        if tool_calls:
            # Append the assistant's message with tool calls to history/context
            messages.append(response_message)
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                print(f"AI Calling Tool: {function_name} with {function_args}")
                
                tool_function = AVAILABLE_TOOLS.get(function_name)
                if tool_function:
                    tool_response = tool_function(**function_args)
                    
                    # send info back to model
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(tool_response)
                    })

            # Second Call: Get Final Response with Tool Data
            final_completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages
            )
            final_reply = final_completion.choices[0].message.content
            return jsonify({"reply": final_reply})

        else:
            # No tool call, just return the text
            return jsonify({"reply": response_message.content})

    except Exception as e:
        print(f"--- GROQ API ERROR ---\n{e}\n--- END ERROR ---")
        return jsonify({"error": "I am having trouble connecting to the medical database right now."}), 500
