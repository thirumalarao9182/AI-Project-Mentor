
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ProjectFile } from '../types';
import { createChat } from '../services/geminiService';

interface MentorChatProps {
  files: ProjectFile[];
}

const MentorChat: React.FC<MentorChatProps> = ({ files }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChat(files);
  }, [files]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const botMsg: ChatMessage = { 
        role: 'model', 
        text: response.text || "I couldn't process that request.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to mentor.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl shadow-sm border border-border-main overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-border-main flex items-center justify-between bg-muted-bg/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold border border-indigo-500/20">M</div>
          <div>
            <h3 className="font-bold text-text-primary leading-none">Project Mentor</h3>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online & Context-Aware</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p className="text-text-secondary">Ask me anything about your code, structure, or potential improvements.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-muted-bg text-text-primary rounded-tl-none border border-border-main'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] mt-1 block opacity-60`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted-bg p-4 rounded-2xl rounded-tl-none border border-border-main">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted-bg border-t border-border-main">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe a feature you want to add or ask for a fix..."
            className="w-full bg-card border border-border-main text-text-primary rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm h-12"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
