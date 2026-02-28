export const formatMoney = (amount: number): string =>
  amount.toLocaleString('ru-RU') + ' \u20BD'

export const formatDate = (date: string): string => {
  const d = new Date(date)
  const datePart = d.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
  const timePart = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })
  return `${datePart} ${timePart}`
}
