import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';

const editorTheme = EditorView.theme({
  '&': { backgroundColor: '#020617', color: '#e2e8f0' },
  '.cm-gutters': { backgroundColor: '#0f172a', border: 'none' },
  '.cm-activeLine': { backgroundColor: '#1e293b' },
  '.cm-activeLineGutter': { backgroundColor: '#1e293b' },
  '.cm-cursor': { borderLeftColor: '#06b6d4' },
  '.cm-selectionBackground': { backgroundColor: '#155e75' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#155e75' },
}, { dark: true });


interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  language?: 'html' | 'css' | 'javascript';
}

export const CodeEditor = ({ content, onChange, language = 'html' }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // 用 ref 持有最新 onChange，避免将其纳入 effect deps 导致编辑器重建
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const getLanguageExtension = () => {
      switch (language) {
        case 'html':
          return html();
        case 'css':
          return css();
        case 'javascript':
          return javascript();
        default:
          return html();
      }
    };

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        getLanguageExtension(),
        autocompletion(),
        closeBrackets(),
        oneDark,
        editorTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%', maxHeight: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // 延迟请求测量刷新，确保在容器可见后正确计算
    requestAnimationFrame(() => {
      if (viewRef.current) {
        viewRef.current.requestMeasure();
      }
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    // 仅在外部内容与当前编辑器内容不一致时更新（避免输入时循环触发）
    if (currentDoc !== content) {
      // 保留当前光标位置（超出新文档长度时截断到末尾）
      const oldSel = view.state.selection.main;
      const newDocLen = content.length;
      const anchor = Math.min(oldSel.anchor, newDocLen);
      const head = Math.min(oldSel.head, newDocLen);
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
        selection: { anchor, head },
      });
    }
  }, [content]);

  return (
    <div className="h-full w-full">
      <div
        ref={editorRef}
        className="h-full w-full font-mono"
        style={{ fontSize: '13px' }}
      />
    </div>
  );
};
