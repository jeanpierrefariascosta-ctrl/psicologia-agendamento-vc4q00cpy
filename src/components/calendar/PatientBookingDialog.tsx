import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, getDay, addMinutes, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  createAppointment,
  getPsychologists,
  getPsychologistAvailability,
  getPsychologistAppointments,
} from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'

export function PatientBookingDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess?: () => void
}) {
  const { user } = useAuth()
  const [psychs, setPsychs] = useState<any[]>([])
  const [selectedPsychId, setSelectedPsychId] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const [availability, setAvailability] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getPsychologists().then(setPsychs)
      setSelectedPsychId('')
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setAvailability([])
      setAppointments([])
    }
  }, [open])

  useEffect(() => {
    if (selectedPsychId) {
      getPsychologistAvailability(selectedPsychId).then(setAvailability)
      getPsychologistAppointments(selectedPsychId).then(setAppointments)
      setSelectedDate(undefined)
      setSelectedSlot(null)
    }
  }, [selectedPsychId])

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedPsychId) return []

    const dayOfWeek = getDay(selectedDate)
    const dayAvail = availability.filter((a) => a.day_of_week === dayOfWeek)

    if (dayAvail.length === 0) return []

    const slots: Date[] = []

    for (const avail of dayAvail) {
      const startTimeParts = avail.start_time.split(':')
      const endTimeParts = avail.end_time.split(':')

      let currentSlot = new Date(selectedDate)
      currentSlot.setHours(parseInt(startTimeParts[0], 10), parseInt(startTimeParts[1], 10), 0, 0)

      const endSlot = new Date(selectedDate)
      endSlot.setHours(parseInt(endTimeParts[0], 10), parseInt(endTimeParts[1], 10), 0, 0)

      while (isBefore(currentSlot, endSlot)) {
        const nextSlot = addMinutes(currentSlot, 60)
        if (!isBefore(endSlot, nextSlot)) {
          slots.push(currentSlot)
        }
        currentSlot = nextSlot
      }
    }

    const now = new Date()
    return slots.filter((slot) => {
      if (isBefore(slot, now)) return false

      const isBooked = appointments.some((appt) => {
        const apptStart = new Date(appt.start_time)
        return apptStart.getTime() === slot.getTime()
      })

      return !isBooked
    })
  }, [selectedDate, selectedPsychId, availability, appointments])

  const handleBook = async () => {
    if (!selectedPsychId || !selectedSlot) return
    setLoading(true)

    const end = addMinutes(selectedSlot, 60)

    try {
      await createAppointment({
        patient: user?.id,
        psychologist: selectedPsychId,
        start_time: selectedSlot.toISOString(),
        end_time: end.toISOString(),
        status: 'scheduled',
      })
      toast({ title: 'Sessão agendada com sucesso!' })
      onSuccess?.()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao agendar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Agendar Consulta</DialogTitle>
          <DialogDescription>
            Selecione o profissional, a data e o horário desejado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">1. Profissional</label>
            <Select value={selectedPsychId} onValueChange={setSelectedPsychId}>
              <SelectTrigger className="w-full bg-background/50 rounded-xl h-12">
                <SelectValue placeholder="Selecione o psicólogo(a)" />
              </SelectTrigger>
              <SelectContent>
                {psychs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPsychId && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-foreground">2. Data da Sessão</label>
              <div className="border rounded-xl p-2 bg-background/50 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="rounded-md"
                  locale={ptBR}
                />
              </div>
            </div>
          )}

          {selectedDate && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-foreground">3. Horário</label>
              {availableSlots.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border/50 text-muted-foreground text-sm">
                  Nenhum horário disponível para esta data.
                </div>
              ) : (
                <ScrollArea className="h-40 w-full rounded-xl border border-border/50 bg-background/50 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.toISOString()}
                        variant={selectedSlot?.getTime() === slot.getTime() ? 'default' : 'outline'}
                        className="w-full rounded-lg"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {format(slot, 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancelar
          </Button>
          <Button
            onClick={handleBook}
            disabled={loading || !selectedSlot}
            className="rounded-full px-8"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
