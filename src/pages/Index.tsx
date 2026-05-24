import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, Clock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import { getAppointments } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Index() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])

  const loadData = async () => {
    const data = await getAppointments()
    setAppointments(data)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('appointments', () => {
    loadData()
  })

  const upcoming = appointments.filter(
    (a) => new Date(a.start_time) > new Date() && a.status === 'scheduled',
  )
  const nextAppt = upcoming.length > 0 ? upcoming[0] : null
  const todayAppts = appointments.filter(
    (a) => format(new Date(a.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
  )

  if (user?.role === 'psychologist') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif text-primary tracking-tight mb-2">Resumo de Hoje</h1>
          <p className="text-muted-foreground text-lg">
            Você tem {todayAppts.length} sessões programadas para hoje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass shadow-subtle border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl">Total de Sessões</h3>
              </div>
              <p className="text-4xl font-light">{appointments.length}</p>
            </CardContent>
          </Card>
          <Card className="glass shadow-subtle border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-serif text-xl">Concluídas</h3>
              </div>
              <p className="text-4xl font-light">
                {appointments.filter((a) => a.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          <Card className="glass shadow-subtle border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-serif text-xl">Agendadas</h3>
              </div>
              <p className="text-4xl font-light">{upcoming.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-serif mb-6">Próxima Sessão</h2>
            {nextAppt ? (
              <div className="glass p-8 rounded-3xl border border-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div>
                    <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                      {format(new Date(nextAppt.start_time), 'EEEE, dd MMM', { locale: ptBR })}
                    </p>
                    <h3 className="text-3xl font-serif">{nextAppt.expand?.patient?.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-light">
                      {format(new Date(nextAppt.start_time), 'HH:mm')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Duração: 1h</p>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <Button className="rounded-full px-8">Iniciar Sessão</Button>
                  <Button variant="outline" className="rounded-full px-6">
                    Ver Prontuário
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass p-8 rounded-3xl text-center border-dashed border-2">
                <p className="text-muted-foreground">Nenhuma sessão futura agendada.</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Agenda do Dia</h2>
              <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
                <Link to="/calendar">
                  Ver Calendário <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {todayAppts.length > 0 ? (
                todayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="glass p-4 rounded-2xl flex items-center justify-between border-border/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border shadow-sm">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{appt.expand?.patient?.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{appt.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(new Date(appt.start_time), 'HH:mm')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground p-4">Agenda livre para hoje.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Patient View
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <span className="text-primary font-serif text-3xl">~</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-primary tracking-tight mb-4">
          Sua jornada importa.
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
          Um espaço seguro para o seu desenvolvimento pessoal e bem-estar emocional.
        </p>
      </div>

      {nextAppt ? (
        <div className="glass p-8 sm:p-12 rounded-[2rem] border-primary/20 shadow-elevation relative overflow-hidden group text-center sm:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full transition-transform duration-700 group-hover:scale-110" />
          <div className="relative z-10 sm:flex items-center justify-between">
            <div className="mb-6 sm:mb-0">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">
                Próxima Sessão
              </p>
              <h3 className="text-3xl sm:text-4xl font-serif mb-2">
                {format(new Date(nextAppt.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <p className="text-xl text-muted-foreground">
                às {format(new Date(nextAppt.start_time), 'HH:mm')} com{' '}
                {nextAppt.expand?.psychologist?.name}
              </p>
            </div>
            <div>
              <Button
                size="lg"
                className="rounded-full px-8 text-md h-14 w-full sm:w-auto shadow-sm transition-transform hover:-translate-y-1"
              >
                Acessar Sessão
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-12 rounded-[2rem] text-center border-dashed border-2 border-primary/20 bg-background/30">
          <CalendarIcon className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <h3 className="text-2xl font-serif mb-2">Nenhuma sessão agendada</h3>
          <p className="text-muted-foreground mb-8">Que tal reservar um momento para você?</p>
          <Button asChild size="lg" className="rounded-full px-8 h-12">
            <Link to="/calendar">Agendar Nova Sessão</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
        <Card className="glass shadow-subtle border-border/50 hover:bg-background/80 transition-colors">
          <CardContent className="p-6">
            <h3 className="font-serif text-xl mb-2">Histórico</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Você completou {appointments.filter((a) => a.status === 'completed').length} sessões
              até agora.
            </p>
            <Button variant="link" className="px-0 text-primary">
              Ver evolução <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        <Card className="glass shadow-subtle border-border/50 hover:bg-background/80 transition-colors">
          <CardContent className="p-6">
            <h3 className="font-serif text-xl mb-2">Pagamentos</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Sua situação financeira está em dia.
            </p>
            <Button variant="link" className="px-0 text-primary">
              Ver recibos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
