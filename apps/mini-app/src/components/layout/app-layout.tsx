import { Outlet } from 'react-router-dom'
import { TabBar } from './tab-bar'

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
