export enum MessageSender {
  User = 'user',
  Gemini = 'gemini',
}

export interface OptimizedPromptOutput {
  optimizedCommand: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
  optimizedPrompts?: OptimizedPromptOutput[];
  error?: string;
  isApiKeyError?: boolean;
}