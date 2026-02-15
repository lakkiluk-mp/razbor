import SchemaBuilder from '@pothos/core'
import '@pothos/plugin-prisma'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '../pothos-types'
import { getDatamodel } from '../pothos-types'
import { type PrismaClient, prisma } from '@razbor/db'

export interface Context {
  prisma: PrismaClient
  user: { id: string; telegramId: bigint; username?: string | null } | null
}

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: Context
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    filterConnectionTotalCount: true,
  },
})
