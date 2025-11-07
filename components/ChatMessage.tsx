import React, { useState } from 'react';
import { ChatMessage, MessageSender } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const GeminiAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
    G
  </div>
);

const UserAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  </div>
);

const ApiKeyErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="mt-2 p-3 text-sm text-yellow-200 bg-yellow-900/50 border border-yellow-800 rounded-lg flex gap-3" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 flex-shrink-0 text-yellow-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
    <div>
      <p className="font-semibold">Требуется действие</p>
      <p className="mt-1">{error}</p>
      <p className="mt-2 text-xs opacity-80">Это приложение использует Gemini API. Убедитесь, что вы настроили свой ключ API в переменных окружения проекта.</p>
    </div>
  </div>
);


const PromptBlock: React.FC<{ prompt: any, index: number, copyStatus: any, onCopy: (cmd: string, idx: number) => void }> = ({ prompt, index, copyStatus, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-2 last:mb-0 bg-gray-900/70 p-2 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center bg-gray-800 text-white p-2 rounded-md">
        <pre className="text-green-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-words flex-grow">
          <code aria-label={`Оптимизированная команда: ${prompt.optimizedCommand}`}>{prompt.optimizedCommand}</code>
        </pre>
        <div className="flex items-center ml-2">
          <button
            onClick={() => onCopy(prompt.optimizedCommand, index)}
            className="p-1.5 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition duration-150 ease-in-out"
            aria-label={`Скопировать команду ${prompt.optimizedCommand}`}
          >
            <span className="sr-only">Копировать</span>
            {copyStatus[index] ?
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.045m-7.416 0v3.045c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            }
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition duration-150 ease-in-out"
            aria-label={isExpanded ? 'Свернуть детали' : 'Развернуть детали'}
            aria-expanded={isExpanded}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
      {copyStatus[index] && <span className="text-blue-400 text-xs transition-opacity duration-300 ml-2">{copyStatus[index]}</span>}
      {isExpanded && (
        <div className="pt-2 px-1">
          <p className="text-xs text-gray-300">
            <span className="font-semibold text-gray-100">Объяснение оптимизации:</span> {prompt.explanation}
          </p>
        </div>
      )}
    </div>
  );
};


const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.User;
  const messageContainerClasses = isUser ? 'justify-end' : 'justify-start';
  const messageClasses = isUser
    ? 'bg-blue-500 text-white rounded-br-none'
    : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600';

  const [copyStatus, setCopyStatus] = useState<{ [key: string]: string }>({});

  const handleCopy = async (text: string, key: string | number) => {
    const statusKey = key.toString();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus((prev) => ({ ...prev, [statusKey]: 'Скопировано!' }));
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStatus((prev) => ({ ...prev, [statusKey]: 'Ошибка!' }));
    } finally {
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [statusKey]: '' }));
      }, 2000);
    }
  };


  return (
    <div className={`w-full flex items-end gap-2 my-2 ${messageContainerClasses}`}>
      {!isUser && <GeminiAvatar />}
      <div
        className={`flex flex-col max-w-[85%] p-3 rounded-xl shadow-sm ${messageClasses}`}
      >
        <p className="text-sm break-words">{message.text}</p>
        {message.isApiKeyError && message.error && <ApiKeyErrorMessage error={message.error} />}

        {message.error && !message.isApiKeyError && (
          <div className="mt-2 p-2 text-sm text-red-300 bg-red-900/50 border border-red-700 rounded" role="alert">
            Ошибка: {message.error}
          </div>
        )}
        
        {message.optimizedPrompts && message.optimizedPrompts.length > 0 && (
          <div className="mt-3 p-2 bg-gray-800 rounded-md text-gray-200">
             <p className="font-semibold text-xs text-gray-300 mb-2 px-1">Оптимизированная команда:</p>
            {message.optimizedPrompts.map((prompt, index) => (
              <PromptBlock
                key={index}
                prompt={prompt}
                index={index}
                copyStatus={copyStatus}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
        <span className="mt-1 text-right text-xs opacity-70">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
};

export default ChatMessageComponent;