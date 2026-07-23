/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

// Vite ?raw 后缀导入文件原始字符串内容（用于打包 CHANGELOG.md 到运行时）
declare module '*.md?raw' {
  const content: string;
  export default content;
}

// Vite define 注入的应用版本号
declare const __APP_VERSION__: string;
