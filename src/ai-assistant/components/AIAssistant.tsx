import { useState } from 'react';
import { aiService } from '../services/aiService';
import { AIProvider } from '@/common/types';

interface AIAssistantProps {
  onCodeGenerated: (code: string) => void;
  currentCode: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant = ({ onCodeGenerated, currentCode }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'debug' | 'chat'>('generate');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-3.5-turbo');

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await aiService.generateCode(prompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
      onCodeGenerated(response.content);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      ]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleDebugCode = async () => {
    if (!prompt.trim() || !currentCode) return;

    setIsGenerating(true);
    setMessages((prev) => [...prev, { role: 'user', content: `Code:\n${currentCode}\n\nError:\n${prompt}` }]);

    try {
      const response = await aiService.debugCode(currentCode, prompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      ]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleChat = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await aiService.chat(prompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      ]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleSend = () => {
    switch (activeTab) {
      case 'generate':
        handleGenerateCode();
        break;
      case 'debug':
        handleDebugCode();
        break;
      case 'chat':
        handleChat();
        break;
    }
  };

  const handleSaveSettings = () => {
    if (apiKey.trim()) {
      const provider: AIProvider = {
        id: 'custom',
        name: 'Custom API',
        baseURL: apiUrl.trim(),
        apiKey: apiKey.trim(),
        model: model.trim(),
      };
      aiService.registerProvider(provider);
      aiService.setCurrentProvider('custom');
      setShowSettings(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      <div className="flex items-center justify-between border-b border-dark-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            Code Gen
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'debug'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            Debug
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            Chat
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 text-gray-400 hover:text-white transition-colors"
          title="API Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="p-4 bg-dark-800 border-b border-dark-700">
          <h3 className="text-white font-semibold mb-3">API Settings</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="API URL (e.g., https://api.openai.com/v1)"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
            />
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
            />
            <input
              type="text"
              placeholder="Model (e.g., gpt-3.5-turbo)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={handleSaveSettings}
              className="w-full px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg">{activeTab === 'generate' && 'Describe what code you want to generate...'}</p>
            <p className="text-lg">{activeTab === 'debug' && 'Describe the error you are encountering...'}</p>
            <p className="text-lg">{activeTab === 'chat' && 'Ask a question about web development...'}</p>
            <p className="text-sm mt-2 text-gray-600">Configure API settings in the top right corner</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-500' : 'bg-dark-600'
                }`}
              >
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-dark-700 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-all">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              AI
            </div>
            <div className="bg-dark-700 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-dark-700">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={
              activeTab === 'generate'
                ? 'Enter code generation prompt...'
                : activeTab === 'debug'
                ? 'Enter error description...'
                : 'Enter your question...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};
