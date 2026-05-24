import { useEffect, useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getNotifications, markNotificationRead } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AppHeader() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])

  const loadNotifications = async () => {
    if (!user) return
    const data = await getNotifications(user.id)
    setNotifications(data)
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.recipient === user?.id) {
      toast({ title: 'Nova Notificação', description: e.record.message })
      loadNotifications()
    }
    if (e.action === 'update' && e.record.recipient === user?.id) {
      loadNotifications()
    }
  })

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    loadNotifications()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 glass px-6">
      <SidebarTrigger />
      <div className="flex-1 flex items-center">
        <h1 className="text-lg font-serif text-foreground/80 hidden sm:block">
          {user?.role === 'psychologist' ? `Bom dia, ${user?.name}` : `Olá, ${user?.name}`}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-64 pl-8 bg-background/50 rounded-full border-border/50"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 rounded-full"
            >
              <Bell className="h-5 w-5 text-foreground/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md bg-background/90 backdrop-blur-xl">
            <SheetHeader className="mb-4">
              <SheetTitle className="font-serif text-2xl">Notificações</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma notificação no momento.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border ${n.read ? 'bg-background/50 opacity-60' : 'bg-card shadow-sm border-primary/20'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-medium">{n.message}</p>
                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={() => handleRead(n.id)}
                          >
                            Lida
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(n.created), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
