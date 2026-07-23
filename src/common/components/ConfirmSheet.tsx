import { useEffect, useState } from 'react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve?: (value: boolean) => void;
}

interface ConfirmStore {
  state: ConfirmState | null;
  listeners: Array<(state: ConfirmState | null) => void>;
}

// 全局状态（useRef 风格的单例存储，供 confirm 单例方法与 Container 共享）
const storeRef: { current: ConfirmStore } = {
  current: {
    state: null,
    listeners: [],
  },
};

function emit() {
  const snapshot = storeRef.current.state;
  storeRef.current.listeners.forEach((listener) => listener(snapshot));
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // 若已有 pending confirm，先解析为 false，避免旧 Promise 永久挂起
    if (storeRef.current.state?.resolve) {
      storeRef.current.state.resolve(false);
    }
    storeRef.current.state = { ...options, resolve };
    emit();
  });
}

function close(result: boolean) {
  const state = storeRef.current.state;
  storeRef.current.state = null;
  emit();
  state?.resolve?.(result);
}

// 危险操作判断：确认文案含删除/移除/清除等关键词时使用红色
const DANGER_PATTERN = /删|移除|清除|清空|卸载|销毁|重置/;

// 单例挂载守卫：ConfirmSheetContainer 应全局只挂载一次
let confirmMountCount = 0;

export function ConfirmSheetContainer() {
  const [state, setState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    confirmMountCount++;
    if (confirmMountCount > 1) {
      console.warn('[ConfirmSheet] ConfirmSheetContainer 已挂载多处，可能导致确认弹窗重复');
    }
    const listener = (s: ConfirmState | null) => setState(s);
    storeRef.current.listeners.push(listener);
    return () => {
      confirmMountCount--;
      storeRef.current.listeners = storeRef.current.listeners.filter((l) => l !== listener);
    };
  }, []);

  if (!state) return null;

  const confirmText = state.confirmText ?? '确认';
  const cancelText = state.cancelText ?? '取消';
  const isDanger = DANGER_PATTERN.test(confirmText);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={() => close(false)}
      />
      <div
        className="relative w-full max-w-md bg-slate-900 rounded-t-card shadow-overlay animate-slide-up p-5"
        style={{ paddingBottom: 'calc(20px + var(--safe-area-inset-bottom))' }}
      >
        <h3 className="text-white font-bold text-base">{state.title}</h3>
        {state.message && <p className="mt-2 text-slate-400 text-sm">{state.message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            className="flex-1 min-h-[44px] rounded-btn bg-slate-700 text-white text-sm font-medium active:opacity-80 transition-opacity"
            onClick={() => close(false)}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 min-h-[44px] rounded-btn text-white text-sm font-medium active:opacity-80 transition-opacity ${isDanger ? 'bg-red-500' : 'bg-cyan-500'}`}
            onClick={() => close(true)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
