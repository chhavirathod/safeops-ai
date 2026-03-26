import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
    base: command === 'build' ? './' : '/',
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                warehouse: resolve(__dirname, 'warehouse.html'),
            },
        },
    },
    server: {
        port: 5173,
        open: process.env.ELECTRON_RUN !== '1',
    },
}))
