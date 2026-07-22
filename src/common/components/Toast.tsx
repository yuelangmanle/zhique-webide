import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  leaving: boolean;
}

interface ToastStore {
  toasts: ToastItem[];
  listeners: Array<(toasts: ToastItem[]) => void>;
}

// 全局状态（useRef 风格的单例存储，供 toast 单例方法与 Container 共享）
const storeRef: { current: ToastStore } = {
  current: {
    toasts: [],
    listeners: [],
  },
};

let nextId = 0;

function emit() {
  const snapshot = [...storeRef.current.toasts];
  storeRef.current.listeners.forEach((listener) => listener(snapshot));
}

function addToast(type: ToastType, message: string) {
  const id = nextId++;
  storeRef.current.toasts = [...storeRef.current.toasts, { id, type, message, leaving: false }];
  // 最多同时显示 3 条，挤掉最早的
  if (storeRef.current.toasts.length > 3) {
    storeRef.current.toasts = storeRef.current.toasts.slice(storeRef.current.toasts.length - 3);
  }
  emit();
  // 2.5 秒后淡出并移除
  window.setTimeout(() => {
    storeRef.current.toasts = storeRef.current.toasts.map((t) =>
      t.id === id ? { ...t, leaving: true } : t
    );
    emit();
    window.setTimeout(() => {
      storeRef.current.toasts = storeRef.current.toasts.filter((t) => t.id !== id);
      emit();
    }, 200);
  }, 2500);
}

export const toast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  info: (message: string) => addToast('info', message),
};

const TYPE_DOT: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-cyan-500',
};

const TYPE_TEXT: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-cyan-500',
};

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toasts: ToastItem[]) => setItems(toasts);
    storeRef.current.listeners.push(listener);
    return () => {
      storeRef.current.listeners = storeRef.current.listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 px-4 w-full max-w-md pointer-events-none"
      style={{ bottom: '80px' }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-btn bg-slate-800 text-white text-sm shadow-elevated w-fit max-w-full ${t.leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
        >
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[t.type]}`} />
          <span className={`font-medium shrink-0 ${TYPE_TEXT[t.type]}`}>·</span>
          <span className="break-words">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
