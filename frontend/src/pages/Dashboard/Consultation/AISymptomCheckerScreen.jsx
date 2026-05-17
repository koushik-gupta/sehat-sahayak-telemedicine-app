import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import offlineSymptoms from '../../../data/symptoms-multi.json';
import { translations } from '../../../translations';
import { getUiCopy } from '../../../i18n/uiCopy';
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Globe,
  History,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  getGlassPanelClass,
  useDashboardTheme,
} from '../DashboardThemeContext';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pa', label: 'Punjabi' },
];

const LANGUAGE_TO_API = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  pa: 'Punjabi',
};

let messageSequence = 0;

const createMessage = (from, text, options = null) => ({
  id: `chat-${messageSequence++}`,
  from,
  text,
  options,
});

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

function getInitialConversation(currentLanguage, isOnlineMode) {
  const currentTranslations = translations[currentLanguage] || translations.en;
  const currentOfflineData = offlineSymptoms[currentLanguage] || offlineSymptoms.en;

  if (!currentTranslations || !currentOfflineData?.start) {
    return {
      messages: [
        createMessage('ai', 'Hello. I am ready to help you review symptoms and next steps.'),
      ],
      offlineNodeKey: 'start',
    };
  }

  return {
    messages: [
      createMessage(
        'ai',
        isOnlineMode ? currentTranslations.aiWelcome : currentOfflineData.start.question,
        isOnlineMode ? null : currentOfflineData.start.options
      ),
    ],
    offlineNodeKey: 'start',
  };
}

const shellEntrance = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const messageMotion = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

const Motion = motion;

function AISymptomCheckerScreen({ onBack, t, language, onLanguageChange }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const reduceMotion = useReducedMotion();
  const resolvedLanguage = offlineSymptoms[language] ? language : 'en';

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(resolvedLanguage);
  const [, setOfflineNodeKey] = useState('start');
  const [forceOfflineFallback, setForceOfflineFallback] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasMountedChatRef = useRef(false);
  const effectiveOnline = isOnline && !forceOfflineFallback;

  useEffect(() => {
    if (offlineSymptoms[language] && language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  }, [currentLanguage, language]);

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
    const initialConversation = getInitialConversation(currentLanguage, effectiveOnline);
    setMessages(initialConversation.messages);
    setOfflineNodeKey(initialConversation.offlineNodeKey);
    setUserInput('');
    setIsLoading(false);
    setAssistantError('');
  }, [currentLanguage, effectiveOnline]);

  useEffect(() => {
    if (!hasMountedChatRef.current) {
      hasMountedChatRef.current = true;
      return;
    }

    chatEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, isLoading, reduceMotion]);

  const currentOfflineData = offlineSymptoms[currentLanguage] || offlineSymptoms.en;
  const aiUi = getUiCopy(currentLanguage).ai;
  const quickPrompts = aiUi.quickPrompts.slice(0, 3);

  const offlineRootOptions = useMemo(
    () => Object.entries(currentOfflineData?.start?.options || {}).slice(0, 8),
    [currentOfflineData]
  );

  const heroTitle = t?.aiSymptomCheckerTitle || 'AI Health Assistant';
  const placeholderText = effectiveOnline ? aiUi.placeholderOnline : aiUi.placeholderOffline;
  const thinkingStatus = effectiveOnline ? 'Assistant is reviewing your message' : 'Loading the next guided step';

  const currentChatSummary = useMemo(() => {
    const firstUserMessage = messages.find((message) => message.from === 'user')?.text;
    const lastMessage = [...messages].reverse().find((message) => message.text)?.text;

    return {
      title: firstUserMessage || heroTitle,
      preview: lastMessage || (effectiveOnline ? aiUi.liveConversationAvailable : aiUi.offlineGuidedModeActive),
    };
  }, [aiUi.liveConversationAvailable, aiUi.offlineGuidedModeActive, effectiveOnline, heroTitle, messages]);

  const localStyles = `
    .sehat-chat-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: ${isDark ? 'rgba(103,232,249,0.34) transparent' : 'rgba(14,165,233,0.32) transparent'};
    }

    .sehat-chat-scrollbar::-webkit-scrollbar {
      width: 8px;
    }

    .sehat-chat-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sehat-chat-scrollbar::-webkit-scrollbar-thumb {
      background: ${isDark ? 'linear-gradient(180deg, rgba(56,189,248,0.56), rgba(45,212,191,0.4))' : 'linear-gradient(180deg, rgba(14,165,233,0.38), rgba(45,212,191,0.34))'};
      border-radius: 999px;
    }

    .sehat-chat-shell::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 14% 18%, ${isDark ? 'rgba(34,211,238,0.16)' : 'rgba(34,211,238,0.20)'} 0, transparent 24%),
        radial-gradient(circle at 86% 12%, ${isDark ? 'rgba(59,130,246,0.14)' : 'rgba(59,130,246,0.17)'} 0, transparent 22%),
        radial-gradient(circle at 68% 78%, ${isDark ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.14)'} 0, transparent 26%);
      pointer-events: none;
      opacity: 0.95;
    }

    .sehat-chat-grid {
      background-image:
        linear-gradient(${isDark ? 'rgba(148,163,184,0.07)' : 'rgba(148,163,184,0.08)'} 1px, transparent 1px),
        linear-gradient(90deg, ${isDark ? 'rgba(148,163,184,0.07)' : 'rgba(148,163,184,0.08)'} 1px, transparent 1px);
      background-size: 22px 22px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,0.26), transparent 82%);
      pointer-events: none;
    }
  `;

  const resetConversation = () => {
    const hasUserMessage = messages.some((message) => message.from === 'user');
    if (hasUserMessage) {
      setPreviousChats((previous) => [
        {
          id: `previous-chat-${Date.now()}`,
          title: currentChatSummary.title,
          preview: currentChatSummary.preview,
          timestamp: new Date().toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
        ...previous,
      ].slice(0, 8));
    }

    const initialConversation = getInitialConversation(currentLanguage, effectiveOnline);
    setMessages(initialConversation.messages);
    setOfflineNodeKey(initialConversation.offlineNodeKey);
    setUserInput('');
    setIsLoading(false);
    setAssistantError('');
    setIsHistoryOpen(false);
    inputRef.current?.focus();
  };

  const retryLiveAssistant = () => {
    setAssistantError('');
    setForceOfflineFallback(false);
    inputRef.current?.focus();
  };

  const addAiMessage = (text, options = null) => {
    setMessages((previous) => [...previous, createMessage('ai', text, options)]);
  };

  const sendOnlineMessage = async (rawText) => {
    const trimmedText = rawText.trim();
    if (!trimmedText || isLoading) {
      return;
    }

    const outgoingMessage = createMessage('user', trimmedText);
    const currentHistory = [...messages, outgoingMessage];
    const startTime = Date.now();

    setMessages(currentHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: currentHistory.slice(0, -1),
          message: trimmedText,
          language: LANGUAGE_TO_API[currentLanguage] || 'English',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'The AI assistant request failed.';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `The AI assistant request failed with status ${response.status}.`;
        }

        const requestError = new Error(errorMessage);
        requestError.status = response.status;
        throw requestError;
      }

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      const holdFor = elapsed < 720 ? 720 - elapsed : 140;

      if (!reduceMotion) {
        await wait(holdFor);
      }

      setAssistantError('');
      addAiMessage(data.reply || 'I was not able to generate a reply just now. Please try again.');
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error?.message || 'The AI assistant is unavailable right now.';
      const shouldFallbackToOffline =
        !navigator.onLine || (typeof error?.status === 'number' && error.status >= 500);

      if (shouldFallbackToOffline) {
        setAssistantError(errorMessage);
        setForceOfflineFallback(true);
      } else {
        addAiMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    await sendOnlineMessage(userInput);
  };

  const handleOfflineChoice = (choice, nextNodeKey) => {
    if (isLoading) {
      return;
    }

    const nextNode = currentOfflineData?.[nextNodeKey];
    setMessages((previous) => [...previous, createMessage('user', choice)]);
    setIsLoading(true);

    window.setTimeout(
      () => {
        if (!nextNode) {
          addAiMessage('Sorry, I could not load the next step. Please restart the assistant.');
          setIsLoading(false);
          return;
        }

        if (nextNode.question) {
          addAiMessage(nextNode.question, nextNode.options || null);
        } else if (nextNode.recommendation) {
          addAiMessage(nextNode.recommendation);
        } else {
          addAiMessage('Please restart the assistant and try another symptom path.');
        }

        setOfflineNodeKey(nextNodeKey);
        setIsLoading(false);
      },
      reduceMotion ? 0 : 680
    );
  };

  const renderUserMessage = (message) => (
    <motion.div
      key={message.id}
      layout
      variants={messageMotion}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className="flex justify-end"
    >
      <div className="flex max-w-[92%] items-end gap-3 sm:max-w-[82%]">
        <motion.div
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          className={`order-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border text-white shadow-[0_16px_38px_-22px_rgba(14,165,233,0.7)] ${
            isDark
              ? 'border-cyan-300/20 bg-white/10'
              : 'border-white/50 bg-white/35 backdrop-blur-xl'
          }`}
        >
          <User size={18} />
        </motion.div>

        <div className="order-1">
          <div className="mb-2 flex items-center justify-end gap-2 pr-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
            <span className={isDark ? 'text-cyan-200/75' : 'text-sky-600/80'}>You</span>
          </div>

          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : { boxShadow: '0 24px 60px -26px rgba(8,145,178,0.52)' }
            }
            className={`relative overflow-hidden rounded-[26px] rounded-br-lg px-5 py-4 text-sm leading-7 text-white shadow-[0_24px_65px_-28px_rgba(8,145,178,0.55)] ${
              isDark
                ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.72),rgba(14,165,233,0.84),rgba(13,148,136,0.82))]'
                : 'bg-[linear-gradient(135deg,#0369a1_0%,#0f766e_52%,#0f766e_100%)]'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26),transparent_42%,rgba(255,255,255,0.08)_100%)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/18 blur-2xl" />
            <p className="relative whitespace-pre-wrap break-words">{message.text}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderAiMessage = (message) => {
    const lowerText = (message.text || '').toLowerCase();
    const showsEmergencyBadge =
      lowerText.includes('emergency') ||
      lowerText.includes('immediately') ||
      lowerText.includes('urgent');
    const showsGuidanceBadge =
      lowerText.includes('doctor') ||
      lowerText.includes('not medical advice') ||
      lowerText.includes('consult');

    return (
      <motion.div
        key={message.id}
        layout
        variants={messageMotion}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={reduceMotion ? undefined : { y: -2 }}
        className="flex justify-start"
      >
        <div className="flex max-w-[94%] items-start gap-3 sm:max-w-[84%]">
          <motion.div
            animate={
              isLoading && !reduceMotion
                ? {
                    boxShadow: [
                      '0 0 0 rgba(14,165,233,0.18)',
                      '0 0 0 8px rgba(14,165,233,0.04)',
                      '0 0 0 rgba(14,165,233,0.18)',
                    ],
                  }
                : undefined
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white shadow-[0_18px_38px_-22px_rgba(14,165,233,0.7)]"
          >
            <Bot size={18} />
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 pl-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
              <span className={isDark ? 'text-cyan-200/75' : 'text-slate-500'}>SehatSahayak AI</span>
              {isLoading && (
                <motion.span
                  animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] tracking-[0.2em] ${
                    isDark ? 'bg-cyan-400/10 text-cyan-200/80' : 'bg-cyan-100 text-cyan-700'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Thinking
                </motion.span>
              )}
            </div>

            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : { boxShadow: '0 24px 55px -28px rgba(15,23,42,0.18)' }
              }
              className={`relative overflow-hidden rounded-[28px] rounded-tl-lg border px-5 py-4 ${
                isDark
                  ? 'border-white/10 bg-slate-900/72 text-slate-100 backdrop-blur-2xl'
                  : 'border-slate-200/80 bg-white/88 text-slate-800 backdrop-blur-2xl'
              } shadow-[0_24px_55px_-30px_rgba(15,23,42,0.16)]`}
            >
              <div
                className={`pointer-events-none absolute inset-0 ${
                  isDark
                    ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_44%,rgba(34,211,238,0.05)_100%)]'
                    : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.88),transparent_44%,rgba(34,211,238,0.08)_100%)]'
                }`}
              />

              <div className="relative">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isDark ? 'bg-cyan-400/10 text-cyan-200' : 'bg-cyan-50 text-cyan-700'
                    }`}
                  >
                    <Sparkles size={12} />
                    {aiUi.assistantReply}
                  </span>

                  {showsEmergencyBadge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      <AlertTriangle size={12} />
                      {aiUi.urgentCareSignal}
                    </span>
                  )}

                  {!showsEmergencyBadge && showsGuidanceBadge && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isDark ? 'bg-amber-400/10 text-amber-200' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <ShieldCheck size={12} />
                      {aiUi.medicalGuidance}
                    </span>
                  )}
                </div>

                <div
                  className={`prose prose-sm max-w-none whitespace-pre-wrap break-words text-sm leading-7 ${
                    isDark ? 'text-slate-200 prose-p:text-slate-200' : 'text-slate-700 prose-p:text-slate-700'
                  }`}
                  dangerouslySetInnerHTML={{ __html: (message.text || '').replace(/\n/g, '<br />') }}
                />
              </div>
            </motion.div>

            {message.options && !isLoading && (
              <motion.div layout className="mt-3 flex flex-wrap gap-2">
                {Object.entries(message.options).map(([choice, nextNodeKey]) => (
                  <motion.button
                    key={choice}
                    whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleOfflineChoice(choice, nextNodeKey)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      isDark
                        ? 'border-cyan-400/20 bg-cyan-400/8 text-cyan-100 hover:border-cyan-300/35 hover:bg-cyan-400/14'
                        : 'border-cyan-200 bg-white/85 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50'
                    }`}
                  >
                    {choice}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`relative flex min-h-[calc(100vh-7rem)] w-full flex-1 flex-col ${isDark ? 'bg-slate-950/20' : 'bg-transparent'}`}>
      <style>{localStyles}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
        <div className={`absolute -left-24 top-10 h-80 w-80 rounded-full blur-3xl ${isDark ? 'bg-cyan-400/12' : 'bg-cyan-200/35'}`} />
        <div className={`absolute right-0 top-1/4 h-96 w-96 rounded-full blur-3xl ${isDark ? 'bg-blue-500/12' : 'bg-blue-200/30'}`} />
        <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${isDark ? 'bg-teal-400/10' : 'bg-teal-100/45'}`} />
      </div>

      <motion.section
        variants={shellEntrance}
        initial="hidden"
        animate="visible"
        className={`sehat-chat-shell relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border ${glassPanelClass}`}
      >
        <div className="sehat-chat-grid absolute inset-0" />

        <header
          className={`relative z-20 border-b px-4 py-4 sm:px-6 ${
            isDark ? 'border-white/10 bg-slate-950/56' : 'border-white/70 bg-white/64'
          } backdrop-blur-2xl`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onBack}
                aria-label="Back"
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border shadow-sm transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/8 text-slate-200 hover:bg-white/12'
                    : 'border-slate-200/90 bg-white/95 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft size={19} />
              </motion.button>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white shadow-[0_18px_40px_-24px_rgba(14,165,233,0.74)]">
                <Sparkles size={21} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={`truncate text-lg font-bold tracking-tight sm:text-xl ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                    {heroTitle}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      effectiveOnline
                        ? isDark
                          ? 'bg-emerald-400/12 text-emerald-200'
                          : 'bg-emerald-100 text-emerald-700'
                        : isDark
                          ? 'bg-amber-400/12 text-amber-200'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {effectiveOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {effectiveOnline ? aiUi.onlineBadge : aiUi.offlineBadge}
                  </span>
                </div>
                <p className={`mt-0.5 truncate text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {effectiveOnline ? aiUi.liveConversationAvailable : aiUi.offlineGuidedModeActive}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className={`inline-flex h-11 items-center gap-2 rounded-[18px] border px-3 text-sm font-semibold shadow-sm transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/8 text-slate-200 hover:bg-white/12'
                    : 'border-slate-200/90 bg-white/95 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <History size={17} />
                <span className="hidden sm:inline">Previous chats</span>
              </motion.button>

              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={resetConversation}
                aria-label={aiUi.reset}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-[18px] border shadow-sm transition-colors sm:w-auto sm:px-3 ${
                  isDark
                    ? 'border-white/10 bg-white/8 text-slate-200 hover:bg-white/12'
                    : 'border-slate-200/90 bg-white/95 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw size={17} />
                <span className="ml-2 hidden sm:inline">{aiUi.reset}</span>
              </motion.button>

              <div
                className={`flex h-11 items-center gap-2 rounded-[18px] border px-3 shadow-sm ${
                  isDark
                    ? 'border-white/10 bg-white/8 text-slate-100'
                    : 'border-slate-200/90 bg-white/95 text-slate-700'
                }`}
              >
                <Globe size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                <select
                  value={currentLanguage}
                  onChange={(event) => {
                    setCurrentLanguage(event.target.value);
                    onLanguageChange?.(event.target.value);
                  }}
                  className={`max-w-[7.25rem] bg-transparent text-sm font-semibold outline-none ${
                    isDark ? 'text-slate-100' : 'text-slate-700'
                  }`}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <main className="sehat-chat-scrollbar flex min-h-[28rem] flex-1 overflow-y-auto px-3 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
              {assistantError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[24px] border p-4 ${
                    isDark ? 'border-red-400/20 bg-red-500/10' : 'border-red-200 bg-red-50/92'
                  } shadow-[0_16px_40px_-28px_rgba(239,68,68,0.55)]`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-[16px] p-2 shadow-sm ${isDark ? 'bg-white/8 text-red-200' : 'bg-white text-red-600'}`}>
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-red-100' : 'text-red-800'}`}>
                          {aiUi.liveUnavailable}
                        </p>
                        <p className={`mt-1 text-sm leading-6 ${isDark ? 'text-red-100/82' : 'text-red-700'}`}>
                          {assistantError}
                        </p>
                      </div>
                    </div>

                    {isOnline && (
                      <motion.button
                        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={retryLiveAssistant}
                        className={`shrink-0 rounded-[18px] border px-3 py-2 text-sm font-semibold ${
                          isDark
                            ? 'border-red-300/20 bg-white/8 text-red-100 hover:bg-white/12'
                            : 'border-red-200 bg-white text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {aiUi.retryLiveMode}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) =>
                  message.from === 'ai' ? renderAiMessage(message) : renderUserMessage(message)
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="typing-indicator"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex justify-start"
                  >
                    <div className="flex max-w-[90%] items-start gap-3 sm:max-w-[72%]">
                      <motion.div
                        animate={
                          reduceMotion
                            ? undefined
                            : {
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                  '0 18px 38px -22px rgba(14,165,233,0.55)',
                                  '0 22px 45px -18px rgba(14,165,233,0.7)',
                                  '0 18px 38px -22px rgba(14,165,233,0.55)',
                                ],
                              }
                        }
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white"
                      >
                        <Bot size={18} />
                      </motion.div>

                      <div
                        className={`rounded-[28px] rounded-tl-lg border px-5 py-4 ${
                          isDark
                            ? 'border-white/10 bg-slate-900/72 text-slate-100'
                            : 'border-white/70 bg-white/82 text-slate-700'
                        } backdrop-blur-2xl shadow-[0_22px_55px_-32px_rgba(15,23,42,0.22)]`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {[0, 1, 2].map((dot) => (
                              <motion.span
                                key={dot}
                                animate={
                                  reduceMotion
                                    ? undefined
                                    : {
                                        y: [0, -4, 0],
                                        opacity: [0.35, 1, 0.35],
                                        scale: [0.94, 1.12, 0.94],
                                      }
                                }
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                  delay: dot * 0.12,
                                }}
                                className={`h-2.5 w-2.5 rounded-full ${
                                  dot === 0 ? 'bg-cyan-400' : dot === 1 ? 'bg-blue-500' : 'bg-teal-400'
                                }`}
                              />
                            ))}
                          </div>

                          <motion.p
                            animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                            className={`text-sm font-medium ${isDark ? 'text-slate-200/90' : 'text-slate-500'}`}
                          >
                            {thinkingStatus}
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
          </main>

          <footer
            className={`sticky bottom-0 z-20 border-t px-3 py-4 sm:px-6 lg:px-8 ${
              isDark ? 'border-white/10 bg-slate-950/62' : 'border-white/70 bg-white/66'
            } backdrop-blur-2xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
              {effectiveOnline ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((item) => (
                      <motion.button
                        key={item.label}
                        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        onClick={() => sendOnlineMessage(item.prompt)}
                        disabled={isLoading}
                        className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          isDark
                            ? 'border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/20 hover:bg-cyan-400/10 hover:text-white'
                            : 'border-slate-200/80 bg-white/88 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
                        }`}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div
                      className={`group relative flex-1 overflow-hidden rounded-[28px] border ${
                        isDark ? 'border-white/10 bg-slate-900/72' : 'border-slate-200/80 bg-white/96'
                      } backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_48px_-32px_rgba(15,23,42,0.26)] transition-all focus-within:-translate-y-0.5 focus-within:border-cyan-300/50 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_24px_56px_-28px_rgba(14,165,233,0.28)]`}
                    >
                      <div className="pointer-events-none absolute left-4 top-4 text-cyan-500/80">
                        <Sparkles size={18} />
                      </div>
                      <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            handleSendMessage(event);
                          }
                        }}
                        rows={1}
                        placeholder={placeholderText}
                        disabled={isLoading}
                        className={`max-h-32 min-h-[3.5rem] w-full resize-none bg-transparent px-12 py-4 pr-4 text-sm leading-6 outline-none placeholder:text-slate-500 ${
                          isDark ? 'text-slate-100' : 'text-slate-800'
                        }`}
                      />
                    </div>

                    <motion.button
                      whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={isLoading || !userInput.trim()}
                      aria-label="Send message"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white shadow-[0_24px_55px_-24px_rgba(14,165,233,0.8)] transition-all hover:shadow-[0_30px_60px_-20px_rgba(14,165,233,0.9)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send size={19} />
                    </motion.button>
                  </form>
                </>
              ) : (
                <div
                  className={`rounded-[28px] border p-4 ${
                    isDark ? 'border-white/10 bg-slate-900/54' : 'border-white/70 bg-white/72'
                  } backdrop-blur-2xl`}
                >
                  <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                    <WifiOff size={16} className="text-amber-500" />
                    {aiUi.offlineStartingPoints}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {offlineRootOptions.map(([choice, nextNodeKey]) => (
                      <motion.button
                        key={choice}
                        whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        onClick={() => handleOfflineChoice(choice, nextNodeKey)}
                        disabled={isLoading}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                          isDark
                            ? 'border-cyan-400/20 bg-cyan-400/8 text-cyan-100 hover:border-cyan-300/35 hover:bg-cyan-400/12'
                            : 'border-cyan-200 bg-white/85 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50'
                        }`}
                      >
                        {choice}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <p className={`flex items-center justify-center gap-2 text-center text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <ShieldCheck size={14} className="shrink-0 text-cyan-500" />
                {aiUi.notDiagnosisDesc}
              </p>
            </div>
          </footer>
        </div>
      </motion.section>

      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close previous chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l p-5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] ${
                isDark ? 'border-white/10 bg-slate-950/92 text-slate-100' : 'border-white/70 bg-white/94 text-slate-900'
              } backdrop-blur-2xl sm:bottom-4 sm:right-4 sm:top-4 sm:rounded-[30px] sm:border`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${isDark ? 'text-cyan-200/70' : 'text-cyan-700'}`}>
                    History
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">Previous chats</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  aria-label="Close previous chats"
                  className={`flex h-10 w-10 items-center justify-center rounded-[16px] border transition-colors ${
                    isDark ? 'border-white/10 bg-white/8 text-slate-200 hover:bg-white/12' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="sehat-chat-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                <div
                  className={`mb-3 rounded-[24px] border p-4 ${
                    isDark ? 'border-cyan-300/16 bg-cyan-400/10' : 'border-cyan-100 bg-cyan-50/80'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                      Current chat
                    </p>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isDark ? 'bg-white/8 text-cyan-100' : 'bg-white text-cyan-700'}`}>
                      Active
                    </span>
                  </div>
                  <p className={`line-clamp-1 text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {currentChatSummary.title}
                  </p>
                  <p className={`mt-1 line-clamp-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {currentChatSummary.preview}
                  </p>
                </div>

                {previousChats.length > 0 ? (
                  <div className="space-y-3">
                    {previousChats.map((chat) => (
                      <button
                        key={chat.id}
                        type="button"
                        className={`w-full rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 ${
                          isDark
                            ? 'border-white/10 bg-white/7 hover:border-cyan-300/20 hover:bg-white/10'
                            : 'border-slate-200/80 bg-white/86 hover:border-cyan-200 hover:bg-white'
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <p className={`line-clamp-1 text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                            {chat.title}
                          </p>
                          <span className={`shrink-0 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {chat.timestamp}
                          </span>
                        </div>
                        <p className={`line-clamp-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {chat.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`flex min-h-[18rem] flex-col items-center justify-center rounded-[28px] border px-6 text-center ${
                      isDark ? 'border-white/10 bg-white/6' : 'border-slate-200/80 bg-white/72'
                    }`}
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 text-white shadow-[0_18px_40px_-24px_rgba(14,165,233,0.74)]">
                      <History size={22} />
                    </div>
                    <p className={`text-base font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                      No previous chats yet
                    </p>
                    <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                      Conversations you restart during this visit will appear here.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AISymptomCheckerScreen;
