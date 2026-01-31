import { PartCategory } from '@prisma/client'
import type { PartData } from './types'

function q(partName: string, searchNames: string[]): string[] {
  return searchNames.map((name) => `${partName} ${name}`)
}

function part(
  slugPrefix: string,
  searchNames: string[],
  slug: string,
  name: string,
  category: PartCategory,
  schematicZoneCode: string | null,
  configGroup?: string | null,
  customSearchName?: string,
): PartData {
  return {
    name,
    slug: `${slugPrefix}-${slug}`,
    category,
    schematicZoneCode,
    searchQueries: q(customSearchName ?? name.toLowerCase(), searchNames),
    ...(configGroup ? { configGroup } : {}),
  }
}

export function getBaseParts(slugPrefix: string, searchNames: string[]): PartData[] {
  const p = (
    slug: string,
    name: string,
    category: PartCategory,
    schematicZoneCode: string | null,
    configGroup?: string | null,
    customSearchName?: string,
  ) => part(slugPrefix, searchNames, slug, name, category, schematicZoneCode, configGroup, customSearchName)

  return [
    p('hood', 'Капот', 'body', 'hood'),
    p('fender-fl', 'Крыло переднее левое', 'body', 'fender_fl'),
    p('fender-fr', 'Крыло переднее правое', 'body', 'fender_fr'),
    p('fender-rl', 'Крыло заднее левое', 'body', 'quarter_panel_l'),
    p('fender-rr', 'Крыло заднее правое', 'body', 'quarter_panel_r'),
    p('door-fl', 'Дверь передняя левая', 'body', 'door_fl'),
    p('door-fr', 'Дверь передняя правая', 'body', 'door_fr'),
    p('door-rl', 'Дверь задняя левая', 'body', 'door_rl'),
    p('door-rr', 'Дверь задняя правая', 'body', 'door_rr'),
    p('trunk', 'Крышка багажника', 'body', 'trunk'),
    p('bumper-f', 'Бампер передний', 'body', 'bumper_f'),
    p('bumper-r', 'Бампер задний', 'body', 'bumper_r'),
    p('mirror-l', 'Зеркало левое', 'body', 'mirror_l'),
    p('mirror-r', 'Зеркало правое', 'body', 'mirror_r'),

    p('headlight-l', 'Фара передняя левая', 'optics', 'headlight_l'),
    p('headlight-r', 'Фара передняя правая', 'optics', 'headlight_r'),
    p('taillight-l', 'Фонарь задний левый', 'optics', 'taillight_l'),
    p('taillight-r', 'Фонарь задний правый', 'optics', 'taillight_r'),
    p('foglight-l', 'Противотуманная фара левая', 'optics', 'fog_light_l'),
    p('foglight-r', 'Противотуманная фара правая', 'optics', 'fog_light_r'),

    p('windshield', 'Лобовое стекло', 'glass', 'windshield'),
    p('rear-glass', 'Заднее стекло', 'glass', 'rear_glass'),
    p('glass-door-fl', 'Стекло двери переднее левое', 'glass', 'side_glass_fl'),
    p('glass-door-fr', 'Стекло двери переднее правое', 'glass', 'side_glass_fr'),
    p('glass-door-rl', 'Стекло двери заднее левое', 'glass', 'side_glass_rl'),
    p('glass-door-rr', 'Стекло двери заднее правое', 'glass', 'side_glass_rr'),

    p('dashboard', 'Панель приборов (торпедо)', 'interior', 'dashboard'),
    p('seat-fl', 'Сиденье переднее левое', 'interior', 'seats_f'),
    p('seat-fr', 'Сиденье переднее правое', 'interior', 'seats_f'),
    p('seat-rear', 'Задний диван', 'interior', 'seats_r'),
    p('steering-wheel', 'Руль', 'interior', 'steering_wheel'),
    p('instrument-cluster', 'Приборная панель', 'interior', null),
    p('multimedia', 'Мультимедиа/магнитола', 'interior', null),
    p('door-card-fl', 'Дверная карта передняя левая', 'interior', null),
    p('door-card-fr', 'Дверная карта передняя правая', 'interior', null),
    p('door-card-rl', 'Дверная карта задняя левая', 'interior', null),
    p('door-card-rr', 'Дверная карта задняя правая', 'interior', null),

    p('radiator', 'Радиатор охлаждения', 'cooling', null),
    p('ac-condenser', 'Радиатор кондиционера', 'cooling', null),

    p('fuse-box', 'Блок предохранителей', 'electrical', null),
    p('comfort-module', 'Блок комфорта', 'electrical', null),
    p('ecu', 'ЭБУ двигателя', 'electrical', null),
    p('battery', 'Аккумулятор', 'electrical', null),
    p('steering-rack', 'Рулевая рейка', 'suspension', null),

    p('rear-beam', 'Балка задняя', 'suspension', null),
    p('strut-fl', 'Стойка передняя левая', 'suspension', 'suspension_f'),
    p('strut-fr', 'Стойка передняя правая', 'suspension', 'suspension_f'),
    p('strut-rl', 'Стойка задняя левая', 'suspension', 'suspension_r'),
    p('strut-rr', 'Стойка задняя правая', 'suspension', 'suspension_r'),
    p('knuckle-l', 'Кулак поворотный левый', 'suspension', null),
    p('knuckle-r', 'Кулак поворотный правый', 'suspension', null),
    p('hub-fl', 'Ступица передняя левая', 'suspension', null),
    p('hub-fr', 'Ступица передняя правая', 'suspension', null),
    p('hub-rl', 'Ступица задняя левая', 'suspension', null),
    p('hub-rr', 'Ступица задняя правая', 'suspension', null),
    p('brake-disc-f', 'Диск тормозной передний', 'suspension', null),
    p('brake-disc-r', 'Диск тормозной задний', 'suspension', null),
    p('caliper-fl', 'Суппорт передний левый', 'suspension', null),
    p('caliper-fr', 'Суппорт передний правый', 'suspension', null),
    p('caliper-rl', 'Суппорт/барабан задний левый', 'suspension', null),
    p('caliper-rr', 'Суппорт/барабан задний правый', 'suspension', null),
    p('subframe-f', 'Подрамник передний', 'suspension', null),
    p('subframe-r', 'Подрамник задний', 'suspension', null),

    p('fuel-pump-hp', 'ТНВД', 'other', null),
    p('throttle-body', 'Дроссельная заслонка', 'other', null),
    p('injectors', 'Форсунки', 'other', null, null, 'форсунка топливная'),
    p('fuel-tank', 'Бак топливный', 'other', null),
  ]
}
