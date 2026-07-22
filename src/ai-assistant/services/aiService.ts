import axios from 'axios';
import { AIProvider, AIResponse } from '@/common/types';

class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProviderId: string = 'openai';

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  setCurrentProvider(id: string): void {
    if (this.providers.has(id)) {
      this.currentProviderId = id;
    }
  }

  getCurrentProvider(): AIProvider | undefined {
    return this.providers.get(this.currentProviderId);
  }

  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  async generateCode(prompt: string): Promise<AIResponse> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider configured');

    const response = await axios.post(
      `${provider.baseURL}/chat/completions`,
      {
        model: provider.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a web development assistant. Generate clean, well-structured HTML/CSS/JavaScript code. Provide only the code without explanations.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      content: response.data.choices[0].message.content,
      model: provider.model,
      usage: response.data.usage,
    };
  }

  async debugCode(code: string, error: string): Promise<AIResponse> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider configured');

    const response = await axios.post(
      `${provider.baseURL}/chat/completions`,
      {
        model: provider.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a web development debugger. Analyze code errors and provide fix suggestions. Explain the issue and provide the corrected code.',
          },
          {
            role: 'user',
            content: `Code:\n${code}\n\nError:\n${error}\n\nPlease provide a fix.`,
          },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      content: response.data.choices[0].message.content,
      model: provider.model,
      usage: response.data.usage,
    };
  }

  async chat(message: string): Promise<AIResponse> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider configured');

    const response = await axios.post(
      `${provider.baseURL}/chat/completions`,
      {
        model: provider.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful web development assistant. Answer questions about HTML, CSS, JavaScript, and mobile web development.',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      content: response.data.choices[0].message.content,
      model: provider.model,
      usage: response.data.usage,
    };
  }
}

export const aiService = new AIService();