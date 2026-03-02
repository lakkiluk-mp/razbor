import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import { BroadcastType, type BroadcastData } from '../types/broadcast'
import { executeBroadcast } from '../../services/broadcast.service'

function toBroadcastData(b: {
  id: string
  message: string | null
  imageUrls: string[]
  status: string
  totalUsers: number
  sentCount: number
  failedCount: number
  createdAt: Date
  updatedAt: Date
}): BroadcastData {
  return {
    id: b.id,
    message: b.message,
    imageUrls: b.imageUrls,
    status: b.status as BroadcastData['status'],
    totalUsers: b.totalUsers,
    sentCount: b.sentCount,
    failedCount: b.failedCount,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }
}

builder.mutationField('createBroadcast', (t) =>
  t.field({
    type: BroadcastType,
    args: {
      message: t.arg.string({ required: false }),
      imageUrls: t.arg.stringList({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<BroadcastData> => {
      assertAdmin(ctx)

      const imageUrls = args.imageUrls ?? []
      if (!args.message && imageUrls.length === 0) {
        throw new GraphQLError('Укажите текст или изображение')
      }
      if (imageUrls.length > 10) {
        throw new GraphQLError('Максимум 10 изображений')
      }
      for (const url of imageUrls) {
        if (!url.startsWith('/uploads/') && !url.startsWith('http://') && !url.startsWith('https://')) {
          throw new GraphQLError('Недопустимый формат URL изображения')
        }
      }
      const maxLen = imageUrls.length > 0 ? 1024 : 4096
      if (args.message && args.message.length > maxLen) {
        throw new GraphQLError(
          imageUrls.length > 0
            ? 'Максимальная длина подписи к фото 1024 символа'
            : 'Максимальная длина сообщения 4096 символов',
        )
      }

      const broadcast = await ctx.prisma.broadcast.create({
        data: {
          message: args.message ?? null,
          imageUrls,
          status: 'draft',
        },
      })

      return toBroadcastData(broadcast)
    },
  })
)

builder.mutationField('sendBroadcast', (t) =>
  t.field({
    type: BroadcastType,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<BroadcastData> => {
      assertAdmin(ctx)

      if (!ctx.telegram) {
        throw new GraphQLError('Telegram бот не настроен')
      }

      const broadcastId = String(args.id)

      const updated = await ctx.prisma.$transaction(async (tx) => {
        const broadcast = await tx.broadcast.findFirst({
          where: { id: broadcastId, status: 'draft' },
        })
        if (!broadcast) {
          throw new GraphQLError('Рассылка не найдена или уже отправлена')
        }
        const totalUsers = await tx.user.count()
        return tx.broadcast.update({
          where: { id: broadcastId },
          data: { status: 'sending', totalUsers },
        })
      })

      const telegram = ctx.telegram
      const prismaRef = ctx.prisma
      executeBroadcast(prismaRef, telegram, broadcastId).catch(async (err) => {
        console.error('[Broadcast] Execution error:', err)
        await prismaRef.broadcast.update({
          where: { id: broadcastId },
          data: { status: 'failed' },
        }).catch(() => {})
      })

      return toBroadcastData(updated)
    },
  })
)

builder.mutationField('cancelBroadcast', (t) =>
  t.field({
    type: BroadcastType,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<BroadcastData> => {
      assertAdmin(ctx)

      const broadcastId = String(args.id)

      const result = await ctx.prisma.broadcast.updateMany({
        where: { id: broadcastId, status: 'sending' },
        data: { status: 'cancelled' },
      })

      if (result.count === 0) {
        throw new GraphQLError('Рассылка не найдена или не отправляется')
      }

      const updated = await ctx.prisma.broadcast.findUniqueOrThrow({
        where: { id: broadcastId },
      })

      return toBroadcastData(updated)
    },
  })
)
