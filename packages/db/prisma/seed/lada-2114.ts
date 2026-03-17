import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { isSharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, drivetrainFWD } from './builders'

const P = 'lada-2114'
const S = ['lada 2114', 'лада 2114', '2114', 'ваз 2114']

const EXCLUDE_PARTS = [
  'Подрамник передний',
  'Подрамник задний',
  'Компрессор кондиционера',
  'Радиатор кондиционера',
  'Диск тормозной задний',
]

const modelSpecificParts: PartData[] = [
  engine(P, S, '1.5-77', 'ВАЗ-2111', 77, ['2111']),
  starter(P, S, '1.5-77'),
  alternator(P, S, '1.5-77'),
  engine(P, S, '1.6-81', 'ВАЗ-21114', 81, ['21114']),
  starter(P, S, '1.6-81'),
  alternator(P, S, '1.6-81'),
  engine(P, S, '1.6-89', 'ВАЗ-21124', 89, ['21124']),
  starter(P, S, '1.6-89'),
  alternator(P, S, '1.6-89'),
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (2001-2013)',
    slug: '2114',
    yearStart: 2001,
    yearEnd: 2013,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-77',
      'engine:1.6-81',
      'engine:1.6-89',
      'transmission:mt',
      'drivetrain:fwd',
    ],
  },
]

export const lada2114Seed = {
  brand: {
    name: 'Lada',
    slug: 'lada',
    logo: 'M11.998 7.312c-5.908 0-10.82 1.669-11.81 3.866a1.974 1.974 0 0 0-.188.831c0 .193.028.508.227.895 1.078 2.156 5.94 3.784 11.775 3.784C18.629 16.688 24 14.588 24 12c0-2.589-5.375-4.688-12.002-4.688Zm-.89.993c.42.383.16 1.217-.642 2.368-.894 1.276-1.752 1.976-2.771 2.233L9.91 8.084h.01c.566-.025.949.005 1.188.22zm5.027 4.7c-.065-.04-.045-.139.03-.154l1-.201a.07.07 0 0 0 .052-.047l.16-.474c.015-.044-.018-.087-.063-.09l-1.866-.103a.305.305 0 0 0-.18.048l-.748.496a.385.385 0 0 0-.17.394c.209 1.09-.202 1.684-2.354 1.942-3.127.373-5.461 0-5.868-.074a.218.218 0 0 0-.234.121l-.213.463c-2.209-.657-3.742-1.653-4.112-2.793 0-.036-.081-.226-.081-.535 0-1.893 3.186-3.49 7.544-3.992h.016s-2.232 4.863-2.612 5.688a.088.088 0 0 0 .08.122h.124c1.31.044 2.892.091 4.87-.396 2.102-.518 3.688-2.005 4.296-3.087.616-1.099.263-1.943.195-2.232 3.878.596 6.359 2.095 6.413 3.84-.014.356-.11.704-.283 1.019-.728 1.214-2.796 2.22-5.55 2.76 1.084-1.188.236-2.27-.446-2.712z',
    sortOrder: 8,
  },

  model: {
    name: '2114',
    slug: '2114',
    isPopular: true,
    sortOrder: 5,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): PartData[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!isSharedPartRef(part) && EXCLUDE_PARTS.includes(part.name)) return false
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
