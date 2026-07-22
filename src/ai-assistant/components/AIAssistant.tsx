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

interface ProviderPreset {
  id: string;
  name: string;
  baseURL: string;
  model: string;
}

// API 多方案预设
const PRESETS: ProviderPreset[] = [
  { id: 'openai', name: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { id: 'deepseek', name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { id: 'moonshot', name: '月之暗面', baseURL: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { id: 'qwen', name: '通义千问', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo' },
  { id: 'custom', name: '自定义', baseURL: '', model: '' },
];

const STORAGE_KEY = 'zhique-ai-providers';
const ACTIVE_KEY = 'zhique-ai-active';

export const AIAssistant = ({ onCodeGenerated, currentCode }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'debug' | 'chat'>('generate');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4o-mini');
  const [selectedPreset, setSelectedPreset] = useState('openai');
  const [savedProviders, setSavedProviders] = useState<ProviderPreset[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 初始化：加载已保存的API方案
  useEffect(() => {
    loadSavedProviders();
  }, []);

  const loadSavedProviders = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const providers: ProviderPreset[] = JSON.parse(raw);
        setSavedProviders(providers);
        // 恢复上次使用的方案
        const activeId = localStorage.getItem(ACTIVE_KEY);
        if (activeId) {
          const active = providers.find((p) => p.id === activeId);
          if (active) {
            setSelectedPreset(active.id);
            setApiUrl(active.baseURL);
            setModel(active.model);
            // 恢复 API Key
            const savedKey = localStorage.getItem('zhique-ai-key-' + active.id);
            if (savedKey) setApiKey(savedKey);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handlePresetChange = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      if (presetId !== 'custom') {
        setApiUrl(preset.baseURL);
        setModel(preset.model);
      }
      // 恢复该方案的 API Key
      const savedKey = localStorage.getItem('zhique-ai-key-' + presetId);
      setApiKey(savedKey || '');
    }
  };

  const handleSaveSettings = () => {
    if (!apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }

    const provider: ProviderPreset = {
      id: selectedPreset,
      name: PRESETS.find((p) => p.id === selectedPreset)?.name || '自定义',
      baseURL: apiUrl.trim(),
      model: model.trim(),
    };

    // 保存到方案列表（去重）
    const updated = savedProviders.filter((p) => p.id !== provider.id);
    updated.push(provider);
    setSavedProviders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_KEY, provider.id);
    localStorage.setItem('zhique-ai-key-' + provider.id, apiKey.trim());

    // 注册到 aiService
    const aiProvider: AIProvider = {
      id: provider.id,
      name: provider.name,
      baseURL: provider.baseURL,
      apiKey: apiKey.trim(),
      model: provider.model,
    };
    aiService.registerProvider(aiProvider);
    aiService.setCurrentProvider(provider.id);

    setShowSettings(false);
  };

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

  const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

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
          className="px-3 text-slate-500 active:text-cyan-400 transition-colors"
        >
          <SettingsIcon />
        </button>
      </div>

      {/* 设置面板 - API多方案 */}
      {showSettings && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 max-h-[70%] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">API 设置</h3>
            <span className="text-slate-500 text-[10px]">支持多方案保存</span>
          </div>

          {/* 预设方案选择 */}
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">选择服务商</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 active:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="API 地址 (如 https://api.openai.com/v1)"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="模型名称 (如 gpt-4o-mini)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSaveSettings}
            className="w-full py-2.5 bg-cyan-500 text-white text-sm font-medium rounded-lg active:bg-cyan-600 transition-colors"
          >
            保存方案
          </button>

          {/* 已保存方案列表 */}
          {savedProviders.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-slate-500 text-[10px] mb-2">已保存方案</p>
              <div className="space-y-1">
                {savedProviders.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded text-xs">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="text-slate-600">{p.model}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
            </svg>
            <p className="text-sm">{placeholders[activeTab]}</p>
            <p className="text-xs mt-2 text-slate-600">点击右上角设置图标配置API</p>
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
      <div
        className="p-2.5 border-t border-slate-800 flex gap-2"
        style={{ paddingBottom: 'calc(var(--safe-area-inset-bottom, 0px) + 0.625rem)' }}
      >
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
