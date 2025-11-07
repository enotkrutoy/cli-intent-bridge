import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const suggestionPrompts = [
  "сравни плюсы и минусы React и Vue",
  "напиши python скрипт для парсинга новостного сайта",
  "составь краткое содержание статьи о квантовых вычислениях",
];

const SuggestionChips: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => (
  <div className="px-4 pb-2 flex flex-wrap gap-2">
    {suggestionPrompts.map((prompt) => (
      <button
        key={prompt}
        onClick={() => onSelect(prompt)}
        className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 transition-colors"
      >
        {prompt}
      </button>
    ))}
  </div>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, apiKey, onApiKeyChange }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 100;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
    setShowSuggestions(input.trim() === '');
  }, [input]);

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      {showSuggestions && <SuggestionChips onSelect={handleSelectSuggestion} />}
       <div className="p-4 pt-2">
        <label htmlFor="api-key-input" className="sr-only">
          Gemini API Key
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
          </div>
          <input
            type="password"
            id="api-key-input"
            name="api-key"
            className="block w-full rounded-md border-0 bg-gray-700 py-2.5 pl-10 text-gray-200 ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500 disabled:ring-gray-700"
            placeholder="Введите ваш ключ Gemini API..."
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            disabled={isLoading}
            aria-label="Поле ввода ключа Gemini API"
          />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 pt-0 flex items-center gap-2">
        <textarea
          ref={textareaRef}
          className="flex-grow p-3 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[56px] overflow-y-auto placeholder:text-gray-400"
          placeholder={isLoading ? "Оптимизирую подсказку..." : "Опишите вашу цель..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          aria-label="Поле ввода сообщения"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out font-medium
                     disabled:bg-blue-400 disabled:cursor-not-allowed h-14"
          disabled={isLoading || !input.trim()}
          aria-label="Отправить сообщение"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Отправить'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;