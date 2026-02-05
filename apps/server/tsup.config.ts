import { defineConfig } from 'tsup'
import { resolve } from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  clean: true,
  noExternal: ['@razbor/api', '@razbor/shared', '@razbor/db'],
  esbuildOptions(options) {
    options.alias = {
      '@razbor/api': resolve(__dirname, '../../packages/api/src'),
      '@razbor/shared': resolve(__dirname, '../../packages/shared/src'),
      '@razbor/db': resolve(__dirname, '../../packages/db/src/client.ts'),
    }
  },
})
