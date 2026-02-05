import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:4000/api/graphql',
  documents: ['src/documents/**/*.graphql'],
  generates: {
    'src/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        enumsAsTypes: true,
        skipTypename: false,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
        },
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
      },
    },
  },
  ignoreNoDocuments: false,
}

export default config
