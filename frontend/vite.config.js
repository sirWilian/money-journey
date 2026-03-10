import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // easier global vars
                additionalData: `@use "@/styles/_variables.scss" as *;`
            }
        }
    },
    // configures "@" to point to src/ (makes imports easier)
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})