import React, { useState, useEffect } from 'react'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAppointments } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { AppointmentDetailsDialog } from '@/components/calendar/AppointmentDetailsDialog'
import { BookingDialog } from '@/components/calendar/BookingDialog'
import { PsychologistBookingDialog } from '@/components/calendar/PsychologistBookingDialog'

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<any[]>([])

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [psychBookingOpen, setPsychBookingOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState({ date: new Date(), hour: 9 })

  const loadData = async () => {
    const data = await getAppointments()
    setAppointments(data)
  }

  useEffect(() => {
    loadData()
  }, [currentDate])

  useRealtime('appointments', () => {
    loadData()
  })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 9 }).map((_, i) => i + 9)

  const handleSlotClick = (d: Date, h: number, appt: any) => {
    if (appt) {
      setSelectedAppt(appt)
      setDetailsOpen(true)
    } else if (user?.role === 'patient') {
      const slotTime = new Date(d)
      slotTime.setHours(h)
      if (slotTime > new Date()) {
        setSelectedSlot({ date: d, hour: h })
        setBookingOpen(true)
      }
    }
  }

  const statusStyles = {
    scheduled: 'bg-primary/20 text-primary-foreground/80 border-primary/30',
    completed: 'bg-green-500/20 text-green-700 border-green-500/30',
    cancelled: 'bg-muted/50 text-muted-foreground border-border/50 line-through opacity-70',
    no_show: 'bg-destructive/20 text-destructive-foreground border-destructive/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Calendário</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas sessões e horários.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {user?.role === 'psychologist' && (
            <Button
              onClick={() => setPsychBookingOpen(true)}
              className="rounded-full shadow-sm mb-2 sm:mb-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          )}
          <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-full border shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-medium text-sm px-4 min-w-[140px] text-center shrink-0">
              {format(weekStart, 'MMMM, yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-elevation border-border/50">
        <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] sm:grid-cols-[80px_repeat(5,minmax(0,1fr))] border-b border-border/50 bg-background/40">
          <div className="border-r border-border/50 p-3" />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={cn(
                'border-r border-border/50 p-3 sm:p-4 text-center',
                isSameDay(d, new Date()) && 'bg-primary/5',
              )}
            >
              <div className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                {format(d, 'eee', { locale: ptBR })}
              </div>
              <div
                className={cn(
                  'text-xl sm:text-2xl font-serif mt-1',
                  isSameDay(d, new Date()) && 'text-primary font-bold',
                )}
              >
                {format(d, 'dd')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] sm:grid-cols-[80px_repeat(5,minmax(0,1fr))] bg-background/20 relative">
          {hours.map((h) => (
            <React.Fragment key={h}>
              <div className="border-b border-r border-border/50 p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground text-right relative -top-3 h-20 sm:h-24">
                {h}:00
              </div>
              {days.map((d) => {
                const appt = appointments.find(
                  (a) =>
                    isSameDay(new Date(a.start_time), d) && new Date(a.start_time).getHours() === h,
                )
                const isPast = new Date(d).setHours(h) < new Date().getTime()

                return (
                  <div
                    key={`${d.toISOString()}-${h}`}
                    className={cn(
                      'border-b border-r border-border/50 p-1 sm:p-1.5 h-20 sm:h-24 transition-colors',
                      !appt &&
                        !isPast &&
                        user?.role === 'patient' &&
                        'cursor-pointer hover:bg-primary/5 group',
                    )}
                    onClick={() => handleSlotClick(d, h, appt)}
                  >
                    {appt ? (
                      <div
                        className={cn(
                          'h-full w-full rounded-lg sm:rounded-xl p-2 sm:p-3 border shadow-sm transition-transform hover:scale-[0.98] cursor-pointer flex flex-col justify-center',
                          statusStyles[appt.status as keyof typeof statusStyles],
                        )}
                      >
                        <p className="font-medium text-xs sm:text-sm truncate leading-tight">
                          {user?.role === 'psychologist'
                            ? appt.expand?.patient?.name
                            : appt.expand?.psychologist?.name}
                        </p>
                        <p className="text-[10px] sm:text-xs opacity-80 mt-1 capitalize hidden sm:block">
                          {appt.status}
                        </p>
                      </div>
                    ) : (
                      !isPast &&
                      user?.role === 'patient' && (
                        <div className="h-full w-full rounded-xl border border-dashed border-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-primary/30 transition-all">
                          <Plus className="w-5 h-5 text-primary/50" />
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appt={selectedAppt}
      />
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        slotDate={selectedSlot.date}
        slotHour={selectedSlot.hour}
      />
      <PsychologistBookingDialog open={psychBookingOpen} onOpenChange={setPsychBookingOpen} />
    </div>
  )
}
