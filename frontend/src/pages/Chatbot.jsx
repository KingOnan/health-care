import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, HelpCircle, Bot } from "lucide-react";
import BottomNav from "../components/BottomNav";
import useBackToClose from "../hooks/useBackToClose";
import {
  EXAMPLE_QUESTIONS,
  CANNED_ANSWERS,
  FALLBACK_ANSWER,
} from "../data/chatbotMessages";

const DOMAINS = [
  { key: "supplement", label: "영양제" },
  { key: "medication", label: "약" },
  { key: "bp", label: "혈압" },
  { key: "glucose", label: "혈당" },
];
const DOMAIN_KEYS = DOMAINS.map((d) => d.key);
const THEME_CLASS = {
  supplement: "theme-supplement",
  medication: "theme-medication",
  bp: "theme-bp",
  glucose: "theme-glucose",
};

const MAX_MESSAGES = 30;

// 모바일(터치)에서는 Enter가 줄바꿈, 데스크톱(마우스·키보드)에서는 Enter가 전송
const IS_TOUCH_DEVICE = window.matchMedia("(pointer: coarse)").matches;

function Chatbot() {
  const { domain } = useParams();
  const initialDomain = DOMAIN_KEYS.includes(domain) ? domain : "bp";
  const [activeDomain, setActiveDomain] = useState(initialDomain);
  const [messagesByDomain, setMessagesByDomain] = useState({
    bp: [],
    glucose: [],
    supplement: [],
    medication: [],
  });
  const [inputText, setInputText] = useState("");
  const [showExampleModal, setShowExampleModal] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  useBackToClose(showExampleModal, () => setShowExampleModal(false));

  const messages = messagesByDomain[activeDomain];

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    resizeTextarea();
  }, []);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: `${Date.now()}-u`, sender: "user", text: trimmed };
    const answer = CANNED_ANSWERS[trimmed] ?? FALLBACK_ANSWER;
    const botMsg = { id: `${Date.now()}-b`, sender: "bot", text: answer };

    setMessagesByDomain((prev) => ({
      ...prev,
      [activeDomain]: [...prev[activeDomain], userMsg, botMsg].slice(-MAX_MESSAGES),
    }));
    setInputText("");
    setShowExampleModal(false);
    requestAnimationFrame(resizeTextarea);
  };

  return (
    <div
      className={`${THEME_CLASS[activeDomain]} flex h-svh flex-col overflow-hidden bg-page-bg pb-18`}
    >
      <div className="shrink-0 p-3">
        <div className="flex gap-1 rounded-2xl border-2 border-gray-300 bg-surface p-1">
          {DOMAINS.map(({ key, label }) => {
            const isActive = key === activeDomain;
            return (
              <button
                key={key}
                onClick={() => setActiveDomain(key)}
                className={`flex-1 rounded-xl py-1.5 text-body font-semibold transition ${
                  isActive ? "bg-primary text-white" : "text-text-muted"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-center text-lg text-text-muted">궁금한 걸 물어보세요</p>
            <div className="flex w-full flex-col gap-2">
              {EXAMPLE_QUESTIONS[activeDomain].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-2xl border-2 border-primary bg-surface px-4 py-3 text-left text-body font-semibold text-primary transition active:scale-[97.5%]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Bot size={20} />
                </div>
              )}
              <p
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-body whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-primary text-white"
                    : "border-2 border-primary bg-surface text-text"
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t-2 border-gray-200 bg-surface p-3">
        <button
          onClick={() => setShowExampleModal(true)}
          className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-2xl bg-primary text-white transition active:scale-95"
        >
          <HelpCircle size={28} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          enterKeyHint={IS_TOUCH_DEVICE ? "enter" : "send"}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            requestAnimationFrame(resizeTextarea);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !IS_TOUCH_DEVICE) {
              e.preventDefault();
              sendMessage(inputText);
            }
          }}
          placeholder="궁금한 걸 물어보세요"
          className="min-h-11.75 max-h-[140px] min-w-0 flex-1 resize-none overflow-y-auto rounded-2xl border-2 border-primary bg-surface px-4 pt-2.5 pb-2 text-lg leading-[1.5rem] font-semibold text-text placeholder:text-gray-400 focus:outline-none"
        />
        <button
          onClick={() => sendMessage(inputText)}
          className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-2xl bg-primary text-white transition active:scale-95"
        >
          <Send size={22} />
        </button>
      </div>

      {showExampleModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowExampleModal(false)}
          />
          <div className="fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-sm flex-col gap-6 rounded-2xl bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-center text-2xl font-semibold text-text">예시 질문</h2>
            <div className="flex flex-col gap-3">
              {EXAMPLE_QUESTIONS[activeDomain].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-primary bg-surface px-4 py-3 text-center text-body font-semibold text-primary transition active:scale-[97.5%]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <BottomNav active={activeDomain} />
    </div>
  );
}

export default Chatbot;
