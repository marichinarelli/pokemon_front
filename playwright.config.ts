import { defineConfig } from '@playwright/test'

try {
  process.loadEnvFile('.env.local')
} catch {
  // sem .env.local: o teste E2E falha ao logar, de forma explícita
}

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
})
