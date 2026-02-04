export type BodyType =
  | 'sedan'
  | 'hatchback'
  | 'liftback'
  | 'crossover'
  | 'suv'
  | 'wagon'
  | 'coupe'
  | 'minivan'
  | 'pickup'

export type CarView = 'front' | 'left' | 'back' | 'right'

export const viewLabels: Record<CarView, string> = {
  front: 'спереди',
  left: 'слева',
  back: 'сзади',
  right: 'справа',
}

export const bodyTypeLabels: Record<BodyType, string> = {
  sedan: 'Седан',
  hatchback: 'Хэтчбек',
  liftback: 'Лифтбек',
  crossover: 'Кроссовер',
  suv: 'Внедорожник',
  wagon: 'Универсал',
  coupe: 'Купе',
  minivan: 'Минивэн',
  pickup: 'Пикап',
}
