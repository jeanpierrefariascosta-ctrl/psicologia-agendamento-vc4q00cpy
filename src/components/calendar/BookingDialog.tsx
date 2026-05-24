import { useState, useEffect } from 'react'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createAppointment, getPsychologists } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

export function BookingDialog({
  open,
  onOpenChange,
  slotDate,
  slotHour,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  slotDate: Date
  slotHour: number
}) {
  const { user } = useAuth()
  const [psychs, setPsychs] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) getPsychologists().then(setPsychs)
  }, [open])

  const handleBook = async () => {
    if (!selected) return toast({ title: 'Selecione um profissional', variant: 'destructive' })
    setLoading(true)

    const start = new Date(slotDate)
    start.setHours(slotHour, 0, 0, 0)
    const end = new Date(start)
    end.setHours(slotHour + 1, 0, 0, 0)

    try {
      await createAppointment({
        patient: user?.id,
        psychologist: selected,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'scheduled',
      })
      toast({ title: 'Sessão agendada com sucesso!' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao agendar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Nova Sessão</DialogTitle>
          <DialogDescription>
            Agendando para {format(slotDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {slotHour}
            :00
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Profissional</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-full bg-background/50 rounded-xl h-12">
                <SelectValue placeholder="Selecione a psicóloga" />
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
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancelar
          </Button>
          <Button
            onClick={handleBook}
            disabled={loading || !selected}
            className="rounded-full px-8"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
