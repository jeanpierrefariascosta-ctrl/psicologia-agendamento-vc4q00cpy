import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { markNotificationRead } from '@/services/api'

export default function Layout() {
  const { user } = useAuth()

  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.recipient === user?.id) {
      if (Notification.permission === 'granted') {
        new Notification('Sereno - Nova Notificação', { body: e.record.message })
      }

      toast({
        title: 'Nova Notificação',
        description: e.record.message,
      })
      markNotificationRead(e.record.id).catch(() => {})
    }
  })

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
            <SidebarTrigger />
            <h1 className="ml-4 font-serif text-lg font-semibold text-primary">Sereno</h1>
          </header>
          <div className="flex-1 p-4 md:p-8 w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
