import { defineConfig } from '@playwright/test'

try {
  process.loadEnvFile('.env.local')
} catch {
  // sem .env.local: o teste E2E falha ao logar, de forma explícita
}

export default defineConfig({
  testDir: 'e2e',
  // E2E fala com Supabase e PokéAPI reais: picos de rede passam dos 5s padrão
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://localhost:5173' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
})
