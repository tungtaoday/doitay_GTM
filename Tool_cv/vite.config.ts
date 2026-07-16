import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import zaloMiniApp from 'zmp-vite-plugin';

export default defineConfig({
    plugins: [
        react(),
        zaloMiniApp({
            app: {
                title: 'Doitay - Hồ Sơ Thợ',
                headerTitle: 'Doitay - Hồ Sơ Thợ',
                headerColor: '#0f172a',
                textColor: 'white',
                statusBar: 'transparent',
            },
        }),
    ],
    css: {
        postcss: './postcss.config.js',
    },
});
