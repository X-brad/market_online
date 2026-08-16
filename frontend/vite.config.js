import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cheminCert = path.join(__dirname, '..', 'certs', 'dev.pem')
const cheminCle = path.join(__dirname, '..', 'certs', 'dev-key.pem')
const httpsDisponible = fs.existsSync(cheminCert) && fs.existsSync(cheminCle)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    https: httpsDisponible ? { cert: fs.readFileSync(cheminCert), key: fs.readFileSync(cheminCle) } : undefined
  }
})