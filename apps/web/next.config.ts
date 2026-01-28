import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@razbor/shared', '@razbor/db', '@razbor/api'],
  serverExternalPackages: [
    '@pothos/core',
    '@pothos/plugin-prisma',
    'graphql',
    'graphql-yoga',
  ],
}

export default nextConfig
