import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue({
            include: [/\.vue$/]
        })
    ],
    resolve: {
        extensions: ['.js', '.ts', '.vue', '.json']
    },
    server: {
        port: 3000
    }
})
