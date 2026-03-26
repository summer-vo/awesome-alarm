/**
 * vite.config.ts
 * 前端构建配置文件。
 * 负责开发服务器配置和打包分包策略，保证移动端页面在开发与生产环境都保持轻量。
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 仅负责单页应用构建，保持配置轻量。
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * 按依赖类别手动拆分 chunk，减少首屏加载压力。
         * @param id 当前模块路径。
         * @returns 命中的 chunk 名称，未命中则交回 Vite 默认策略。
         */
        manualChunks(id) {
          if (id.includes('node_modules/zrender')) {
            return 'zrender-vendor';
          }

          if (id.includes('node_modules/echarts')) {
            return 'echarts-vendor';
          }

          if (id.includes('node_modules/antd-mobile') || id.includes('node_modules/antd-mobile-icons')) {
            return 'mobile-ui-vendor';
          }

          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          return undefined;
        },
      },
    },
  },
});
