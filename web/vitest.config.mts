import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.ts',
        'hooks/**/*.ts',
        'components/rag/**/*.tsx',
        'components/ai-elements/**/*.tsx',
        'app/actions/**/*.ts',
        'app/api/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.config.*',
        'vitest.setup.tsx',
        'scripts/**',
      ],
    },
  },
})