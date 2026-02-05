import { defineConfig } from 'tsup'
import { resolve } from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  noExternal: ['@razbor/api', '@razbor/shared'],
  esbuildOptions(options) {
    options.alias = {
      '@razbor/api': resolve(__dirname, '../../packages/api/src'),
      '@razbor/shared': resolve(__dirname, '../../packages/shared/src'),
    }
  },
})
