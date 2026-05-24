import { Link, useLocation } from 'react-router-dom'
import { Calendar, LayoutDashboard, Settings, Users, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
    { title: 'Calendário', icon: Calendar, url: '/calendar' },
  ]

  if (user?.role === 'psychologist') {
    navItems.push({ title: 'Pacientes', icon: Users, url: '/patients' })
  }

  navItems.push({ title: 'Configurações', icon: Settings, url: '/settings' })

  return (
    <Sidebar className="border-r border-border/50 bg-background/40 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <h2 className="text-xl font-serif text-primary tracking-tight font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">
            ~
          </span>
          Sereno
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-primary/10"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4 text-primary" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-xl mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user?.role === 'psychologist' ? 'Psicóloga' : 'Paciente'}
            </p>
          </div>
        </div>
        <SidebarMenuButton
          onClick={signOut}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
