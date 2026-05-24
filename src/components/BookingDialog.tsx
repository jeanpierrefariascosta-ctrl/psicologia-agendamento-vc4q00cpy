import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface BookingDialogProps {
  open: boolean
  setOpen: (o: boolean) => void
  slot: Date | null
  psychId: string
}

export function BookingDialog({ open, setOpen, slot, psychId }: BookingDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleBook = async () => {
    if (!slot) return
    setLoading(true)
    try {
      const end = new Date(slot.getTime() + 60 * 60 * 1000)
      await pb.collection('appointments').create({
        patient: user.id,
        psychologist: psychId,
        start_time: slot.toISOString(),
        end_time: end.toISOString(),
        status: 'scheduled',
      })
      toast.success('Agendamento confirmado!')
      setOpen(false)
    } catch (e) {
      toast.error('Erro ao agendar. O horário pode não estar mais disponível.')
    }
    setLoading(false)
  }

  if (!slot) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            Confirmar Agendamento
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Deseja marcar uma sessão para{' '}
            <strong className="text-foreground">
              {format(slot, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </strong>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleBook} disabled={loading} className="shadow-sm">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
