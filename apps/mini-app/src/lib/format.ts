export const formatMoney = (amount: number): string =>
  (amount / 100).toLocaleString('ru-RU') + ' \u20BD'

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('ru-RU')
