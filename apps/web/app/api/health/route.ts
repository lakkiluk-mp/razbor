import { prisma } from '@razbor/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
