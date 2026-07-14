import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import zaloMiniApp from 'zmp-vite-plugin';

export default defineConfig({
    plugins: [
        react(),
        zaloMiniApp({
            app: {
                title: 'Thợ Tốt Doitay',
                headerTitle: 'Thợ Tốt Doitay',
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
