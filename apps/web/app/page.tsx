import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Razbor</h1>
      <p className="text-gray-600 mt-2">Калькулятор маржинальности авторазбора</p>
      <Button className="mt-4">Начать расчёт</Button>
    </main>
  )
}
