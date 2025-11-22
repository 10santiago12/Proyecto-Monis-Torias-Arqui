import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ]
    },
    reporters: [
      'default',
      ['allure-vitest/reporter', {
        resultsDir: './allure-results',
        links: {
          issue: {
            urlTemplate: 'https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui/issues/%s'
          }
        }
      }]
    ]
  }
})
