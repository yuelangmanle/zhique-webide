import { useState, useRef, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

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
        { role: 'assistant', content: `错误：${error instanceof Error ? error.message : '未知错误'}` },
      ]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleDebugCode = async () => {
    if (!prompt.trim() || !currentCode) return;

    setIsGenerating(true);
    setMessages((prev) => [...prev, { role: 'user', content: `代码：\n${currentCode}\n\n错误：${prompt}` }]);

    try {
      const response = await aiService.debugCode(currentCode, prompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `错误：${error instanceof Error ? error.message : '未知错误'}` },
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
        { role: 'assistant', content: `错误：${error instanceof Error ? error.message : '未知错误'}` },
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
        name: '自定义API',
        baseURL: apiUrl.trim(),
        apiKey: apiKey.trim(),
        model: model.trim(),
      };
      aiService.registerProvider(provider);
      aiService.setCurrentProvider('custom');
      setShowSettings(false);
    }
  };

  const tabs = [
    { key: 'generate' as const, label: '生成代码' },
    { key: 'debug' as const, label: '调试' },
    { key: 'chat' as const, label: '对话' },
  ];

  const placeholders = {
    generate: '描述你想生成的代码...',
    debug: '描述遇到的错误...',
    chat: '问一个关于网页开发的问题...',
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* 标签栏 */}
      <div className="flex items-center border-b border-slate-800 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-cyan-400'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-3 text-slate-500 active:text-slate-300 transition-colors"
        >
          ⚙️
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
          <h3 className="text-white font-medium text-sm">API 设置</h3>
          <input
            type="text"
            placeholder="API 地址"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="模型名称"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg active:bg-cyan-600 transition-colors"
          >
            保存设置
          </button>
        </div>
      )}

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-sm">{placeholders[activeTab]}</p>
            <p className="text-xs mt-2 text-slate-600">点击右上角⚙️配置API</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                {msg.role === 'user' ? '我' : 'AI'}
              </div>
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-white rounded-tr-md'
                    : 'bg-slate-800 text-slate-200 rounded-tl-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              AI
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <div className="p-2.5 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder={placeholders[activeTab]}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          disabled={isGenerating}
        />
        <button
          onClick={handleSend}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded-xl active:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
};
