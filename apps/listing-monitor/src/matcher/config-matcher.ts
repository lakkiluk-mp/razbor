import type { PrismaClient } from '@razbor/db'

export interface ConfigMatchResult {
  engines: string[]
  transmissions: string[]
  drivetrains: string[]
  isExact: boolean
}

const TRANSMISSION_PREFIX_MAP: Record<string, string[]> = {
  AT: ['at'],
  MT: ['mt'],
  CVT: ['cvt'],
  AMT: ['amt', 'robot'],
  DSG: ['dsg'],
}

function extractEngineVolume(configGroup: string): string {
  const value = configGroup.slice('engine:'.length)
  const dashIdx = value.indexOf('-')
  return dashIdx === -1 ? value : value.slice(0, dashIdx)
}

function matchesTransmission(
  configGroup: string,
  transmission: string,
): boolean {
  const value = configGroup.slice('transmission:'.length)
  const prefixes = TRANSMISSION_PREFIX_MAP[transmission.toUpperCase()]
  if (!prefixes) return false
  return prefixes.some((prefix) => value.startsWith(prefix))
}

export async function findMatchingConfigs(
  generationId: string,
  engineVolume: string | null,
  transmission: string | null,
  prisma: PrismaClient,
): Promise<ConfigMatchResult> {
  const modelParts = await prisma.modelPart.findMany({
    where: { generationId },
    select: { part: { select: { configGroup: true } } },
  })

  const allGroups = new Set<string>()
  for (const mp of modelParts) {
    if (mp.part.configGroup) {
      allGroups.add(mp.part.configGroup)
    }
  }

  const allEngines = [...allGroups].filter((g) => g.startsWith('engine:'))
  const allTransmissions = [...allGroups].filter((g) =>
    g.startsWith('transmission:'),
  )
  const allDrivetrains = [...allGroups].filter((g) =>
    g.startsWith('drivetrain:'),
  )

  const normalizedVolume = engineVolume?.replace(/[a-zA-Zа-яА-ЯёЁ]+$/, '') ?? null

  const engines =
    normalizedVolume === null
      ? allEngines
      : allEngines.filter((g) => extractEngineVolume(g) === normalizedVolume)

  const transmissions =
    transmission === null
      ? allTransmissions
      : allTransmissions.filter((g) => matchesTransmission(g, transmission))

  return {
    engines,
    transmissions,
    drivetrains: allDrivetrains,
    isExact:
      engines.length === 1 &&
      transmissions.length === 1 &&
      allDrivetrains.length <= 1,
  }
}
