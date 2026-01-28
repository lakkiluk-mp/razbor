import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@razbor/shared', '@razbor/db', '@razbor/api'],
}

export default nextConfig
