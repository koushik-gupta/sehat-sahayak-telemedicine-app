// frontend/src/pages/Dashboard/Consultation/AISymptomCheckerScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import offlineSymptoms from '../../../data/symptoms-multi.json';
import { translations } from '../../../translations';
import { Send, ArrowLeft, Globe, Bot, User, AlertTriangle, Sparkles } from 'lucide-react';

function AISymptomCheckerScreen({ onBack }) {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [offlineNodeKey, setOfflineNodeKey] = useState('start');
  const chatEndRef = useRef(null);

  // Effect to listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setMessages([]); // Clear previous messages
    setOfflineNodeKey('start');

    const currentTranslations = translations[currentLanguage];
    const currentOfflineData = offlineSymptoms[currentLanguage];

    if (!currentTranslations || !currentOfflineData) {
      console.error(`Language data for '${currentLanguage}' not found!`);
      return;
    }

    const welcomeMessage = isOnline
      ? currentTranslations.aiWelcome
      : currentOfflineData.start.question;

    const initialOptions = isOnline
      ? null
      : currentOfflineData.start.options;

    addAiMessage(welcomeMessage, initialOptions);

  }, [isOnline, currentLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);


  // --- CORE LOGIC FUNCTIONS ---
  const addAiMessage = (text, options = null) => {
    setMessages(prev => [...prev, { from: 'ai', text, options }]);
  };

  const addUserMessage = (text) => {
    const newMessages = [...messages, { from: 'user', text }];
    setMessages(newMessages);
    return newMessages;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const currentHistory = addUserMessage(userInput);
    const userText = userInput;
    setUserInput('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory.slice(0, -1),
          message: userText,
          language: { en: 'English', hi: 'Hindi', bn: 'Bengali', pa: 'Punjabi' }[currentLanguage] || 'English'
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      addAiMessage(data.reply);
    } catch (error) {
      console.error('Fetch error:', error);
      addAiMessage("Sorry, I'm having trouble connecting. Please check your internet connection.");
    }
    setIsLoading(false);
  };

  const handleOfflineChoice = (choice, nextNodeKey) => {
    addUserMessage(choice);
    setIsLoading(true);
    setTimeout(() => {
      const nextNode = offlineSymptoms[currentLanguage][nextNodeKey];
      if (nextNode.question) {
        addAiMessage(nextNode.question, nextNode.options);
      } else if (nextNode.recommendation) {
        addAiMessage(nextNode.recommendation);
      }
      setOfflineNodeKey(nextNodeKey);
      setIsLoading(false);
    }, 800);
  };

  const renderAiMessage = (msg, index) => (
    <div key={index} className="flex gap-4 mb-6 animation-fade-in group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
        <Bot size={20} />
      </div>
      <div className="max-w-[85%]">
        <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-md border border-slate-100 text-slate-700 leading-relaxed relative">
          {/* Disclaimer Badge for medical content (simulated) */}
          {(msg.text || '').toLowerCase().includes('disclaimer') && (
            <div className="absolute -top-3 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <AlertTriangle size={10} /> AI Suggestion
            </div>
          )}

          <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (msg.text || '').replace(/\n/g, '<br />') }} />
        </div>

        {msg.options && !isLoading && (
          <div className="mt-3 flex flex-wrap gap-2 animate-slide-up">
            {Object.entries(msg.options).map(([choice, nextNodeKey]) => (
              <button
                key={choice}
                onClick={() => handleOfflineChoice(choice, nextNodeKey)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95"
              >
                {choice}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">AI Health Assistant</h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {isOnline ? 'Online • Llama 3.1 8B' : 'Offline Mode'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <Globe size={16} className="text-slate-400 ml-1.5" />
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-600 outline-none border-none pr-1"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-8 mt-4">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              Trusted Health Companion
            </span>
          </div>

          {messages.map((msg, index) => (
            msg.from === 'ai'
              ? renderAiMessage(msg, index)
              : (
                <div key={index} className="flex gap-4 mb-6 flex-row-reverse animation-fade-in text-right">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
                    <User size={20} />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-emerald-900/10 text-left">
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
          ))}

          {isLoading && (
            <div className="flex gap-4 mb-6 animation-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                <Bot size={20} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </div>

      {/* Footer / Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 relative shadow-lg z-20">
        {/* Disclaimer Header */}
        <div className="absolute -top-6 left-0 w-full flex justify-center">
          <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-4 py-1 rounded-t-lg border-t border-x border-amber-100 flex items-center gap-1 shadow-sm">
            <AlertTriangle size={10} />
            AI SUGGESTION ONLY. NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {isOnline ? (
            <form className="relative flex items-end gap-2" onSubmit={handleSendMessage}>
              <div className="w-full relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your symptoms (e.g. 'I have a fever' or 'Where can I find Paracetamol?')..."
                  disabled={isLoading}
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          ) : (
            <div className="text-center p-3 bg-amber-50 text-amber-800 rounded-xl text-sm font-medium border border-amber-100">
              You are offline. Limited symptom checker available.
            </div>
          )}
          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-400">
              By using this tool, you verify that you understand this is an AI-driven system and results may vary. <br className="hidden md:block" /> In emergencies, please contact emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISymptomCheckerScreen;