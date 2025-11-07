import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OptimizedPromptOutput } from "../types";

/**
 * Custom error class for API key-related issues.
 */
export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyError";
  }
}

const getGeminiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new ApiKeyError("API ключ не предоставлен.");
  }
  // Create a new instance every time to ensure it uses the latest API key
  return new GoogleGenAI({ apiKey });
};

/**
 * Очищает строку, удаляя обертки markdown-блоков JSON (например, ```json ... ```).
 * @param rawString Необработанная строка ответа от Gemini.
 * @returns Очищенная строка, готовая к JSON.parse().
 */
function cleanJsonString(rawString: string): string {
  let cleaned = rawString.trim();

  // Удаляем markdown-блоки кода, если они присутствуют
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring('```json'.length);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - '```'.length);
  }

  // Удаляем любые оставшиеся начальные/конечные пробелы после удаления ограждений
  return cleaned.trim();
}

/**
 * Generates an optimized CLI prompt for GEMINI-CLI based on a user's natural language query.
 * @param prompt The user's natural language request.
 * @param apiKey The Gemini API key provided by the user.
 * @returns A promise that resolves to an array of OptimizedPromptOutput or throws an error.
 */
export async function generateOptimizedPrompt(prompt: string, apiKey: string): Promise<OptimizedPromptOutput[]> {
  const ai = getGeminiClient(apiKey);

  const systemInstruction = `
  Вы — эксперт по инженерии подсказок для утилиты командной строки под названием GEMINI-CLI.
  Ваша задача — взять нечеткий запрос пользователя на естественном языке и преобразовать его в ясную, структурированную и высокоэффективную подсказку.
  Ваш итоговый результат должен быть одной исполняемой командой для GEMINI-CLI в следующем формате: gemini --model gemini-2.5-flash "[оптимизированный_текст_подсказки]" -y

  В вашем ответе должны быть две вещи:
  1. 'optimizedCommand': Полностью отформатированная строка команды GEMINI-CLI. Эта строка ОБЯЗАТЕЛЬНО должна начинаться с 'gemini --model' и содержать оптимизированный текст в двойных кавычках.
  2. 'explanation': Краткое и ясное объяснение, ПОЧЕМУ сгенерированная подсказка лучше, чем исходный запрос пользователя. Объясните конкретные внесенные изменения (например, добавление контекста, указание формата, использование более сильных глаголов действия) и как они приведут к лучшему ответу от модели Gemini.

  Проанализируйте намерение пользователя, определите его основную цель (например, генерация кода, анализ данных, суммирование, сравнение) и сформулируйте идеальную подсказку для достижения этой цели.
  `;

  const promptSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        optimizedCommand: {
          type: Type.STRING,
          description: `Полностью отформатированная, исполняемая команда для GEMINI-CLI, начинающаяся с 'gemini --model gemini-2.5-flash ...'.`,
        },
        explanation: {
          type: Type.STRING,
          description: 'Краткое объяснение выбора, сделанного при инженерии подсказки для улучшения запроса пользователя.',
        },
      },
      required: ['optimizedCommand', 'explanation'],
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: promptSchema,
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 256 },
      },
    });

    const rawJsonString = response.text;
    if (!rawJsonString.trim()) {
      throw new Error("Gemini API вернул пустой ответ.");
    }

    const jsonStringForParsing = cleanJsonString(rawJsonString);

    try {
      const parsedOutput: OptimizedPromptOutput[] = JSON.parse(jsonStringForParsing);
      if (!Array.isArray(parsedOutput) || !parsedOutput.every(item => item.optimizedCommand && item.explanation)) {
        throw new Error("Gemini API вернул неверную структуру JSON для оптимизированной подсказки. Отсутствуют обязательные поля.");
      }
      return parsedOutput;
    } catch (parseError) {
      console.error("Не удалось разобрать JSON-ответ Gemini:", parseError);
      console.debug("Сырой ответ Gemini (до очистки):", rawJsonString);
      console.debug("Очищенный ответ Gemini (для парсинга):", jsonStringForParsing);
      throw new Error(
        `Не удалось разобрать структурированный ответ Gemini. Убедитесь, что модель вернула корректный JSON.` +
        ` Возможно, ответ был некорректно отформатирован.`
      );
    }

  } catch (error: any) {
    console.error("Ошибка при вызове Gemini API:", error);
    if (error.message && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID"))) {
        throw new ApiKeyError("Ошибка аутентификации: Ваш API ключ недействителен. Пожалуйста, проверьте его и попробуйте снова.");
    }
    throw new Error(`Не удалось сгенерировать подсказку: ${error.message || 'Неизвестная ошибка'}`);
  }
}