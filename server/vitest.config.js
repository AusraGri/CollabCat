import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/

/** @type {import('vite').UserConfig} */
export default defineConfig({
  test: {
    setupFiles: "./vitest.setup.ts",
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        '**/src/**/*.ts',
      ],
      exclude: [
        '**/src/database/**',
        '**/src/entities/**',
        '**/src/trpc/index.ts',
        '**/src/repositories/index.ts',
      ],
    },

    // necessary for Vitest VS Code extension to pick up env variables
    env: loadEnv('', process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})
