/**
 * main.tsx
 * 应用前端入口文件。
 * 负责挂载 React 根节点、加载移动端全局样式，并启动整个监控工作台。
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd-mobile/es/global';
import App from './App';
import './styles/global.css';

// 应用入口保持极简，便于后续接入路由或全局状态。
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
