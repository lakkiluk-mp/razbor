import SchemaBuilder from '@pothos/core'
import '@pothos/plugin-prisma'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '../pothos-types'
import { getDatamodel } from '../pothos-types'
import { type PrismaClient, prisma } from '@razbor/db'

export type TelegramPhoto = string | { source: Buffer; filename?: string }

export interface InputMediaPhoto {
  type: 'photo'
  media: TelegramPhoto
  caption?: string
  parse_mode?: string
}

export interface TelegramApi {
  sendMessage(chatId: number | string, text: string, extra?: Record<string, unknown>): Promise<unknown>
  sendPhoto(chatId: number | string, photo: TelegramPhoto, extra?: Record<string, unknown>): Promise<unknown>
  sendMediaGroup(chatId: number | string, media: InputMediaPhoto[]): Promise<unknown>
}

export interface Context {
  prisma: PrismaClient
  user: { id: string; telegramId: bigint; username?: string | null } | null
  telegram: TelegramApi | null
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
