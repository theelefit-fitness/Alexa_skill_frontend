import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  host: true,
  allowedHosts: [
    '97d7-2406-7400-3b-fb1c-8c3b-9706-4bca-e6f7.ngrok-free.app',
    'e96d-49-204-195-153.ngrok-free.app',
    '020a-2406-7400-3b-c5ba-c8-e03b-219b-8619.ngrok-free.app',
    
  ],
}


})
