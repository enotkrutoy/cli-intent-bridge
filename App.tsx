import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateOptimizedPrompt, ApiKeyError } from './services/geminiService';
import { ChatMessage, MessageSender, OptimizedPromptOutput } from './types';
import ChatInput from './components/ChatInput';
import ChatMessageComponent from './components/ChatMessage';

const AppHeader: React.FC<{
  onClearChat: () => void;
}> = ({ onClearChat }) => (
  <header className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg shadow-md flex-wrap gap-3">
    <div className="flex items-center gap-3">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9.75 6.375c.621 1.076 1.817 1.875 3.075 1.875s2.454-.8 3.075-1.875m-6.15 0a3 3 0 1 0 6.15 0m-6.15 0v-1.125a3 3 0 0 1 3.075-2.625m-3.075 2.625v-1.125a3 3 0 0 0-3.075-2.625m9.3 5.25c.621 1.076 1.817 1.875 3.075 1.875s2.454-.8 3.075-1.875m-6.15 0a3 3 0 1 0 6.15 0m-6.15 0v-1.125a3 3 0 0 1 3.075-2.625m-3.075 2.625v-1.125a3 3 0 0 0-3.075-2.625" />
      </svg>
      <h1 className="text-xl font-bold">Конструктор CLI-подсказок</h1>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onClearChat}
        className="p-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Очистить чат"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  </header>
);

const ThinkingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 my-2 self-start">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">G</div>
    <div className="bg-gray-700 text-gray-300 p-3 rounded-xl rounded-bl-none shadow-sm flex items-center space-x-2">
      <div className="flex space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
      </div>
      <span className="text-sm">Думаю...</span>
    </div>
  </div>
);


const App: React.FC = () => {
  const getInitialMessages = (): ChatMessage[] => {
    return [{
      id: 'welcome',
      sender: MessageSender.Gemini,
      text: 'Привет! Я помогу вам превратить нечеткие запросы в четкие, структурированные подсказки для GEMINI-CLI. Введите ваш Gemini API ключ ниже и опишите вашу цель.',
      timestamp: new Date(),
    }];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('gemini-api-key', apiKey);
  }, [apiKey]);


  const handleSendMessage = useCallback(async (text: string) => {
    if (!apiKey.trim()) {
      const apiKeyMissingMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        sender: MessageSender.Gemini,
        text: 'API ключ не найден.',
        error: 'Пожалуйста, введите ваш Gemini API ключ в поле ниже, чтобы продолжить.',
        isApiKeyError: true,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, apiKeyMissingMessage]);
      return;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      sender: MessageSender.User,
      text: text,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const optimizedPrompts: OptimizedPromptOutput[] = await generateOptimizedPrompt(text, apiKey);
      const geminiResponseText = 'Вот оптимизированная подсказка для вашей цели:';
      const newGeminiMessage: ChatMessage = {
        id: Date.now().toString() + '-gemini',
        sender: MessageSender.Gemini,
        text: geminiResponseText,
        optimizedPrompts: optimizedPrompts,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newGeminiMessage]);
    } catch (error: any) {
      console.error('Ошибка при получении ответа Gemini:', error);
      const isApiKeyError = error instanceof ApiKeyError;
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        sender: MessageSender.Gemini,
        text: isApiKeyError ? 'Проблема с вашим API ключом.' : 'Извините, произошла ошибка при обработке вашего запроса.',
        error: error.message || 'Неизвестная ошибка',
        isApiKeyError: isApiKeyError,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const handleClearChat = () => {
    if (window.confirm('Вы уверены, что хотите очистить историю чата? Это действие необратимо.')) {
      setMessages(getInitialMessages());
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg">
      <AppHeader
        onClearChat={handleClearChat}
      />
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        {isLoading && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 w-full">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
        />
      </div>
    </div>
  );
};

export default App;