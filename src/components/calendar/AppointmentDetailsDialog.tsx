import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cancelAppointment } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appt,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  appt: any
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!appt) return null

  const isFuture = new Date(appt.start_time) > new Date()
  const isScheduled = appt.status === 'scheduled'

  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar esta sessão?')) return
    setLoading(true)
    try {
      await cancelAppointment(appt.id, appt, 'Cancelado pelo usuário', user?.id)
      toast({ title: 'Sessão cancelada com sucesso' })
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const roleName =
    user?.role === 'psychologist' ? appt.expand?.patient?.name : appt.expand?.psychologist?.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Detalhes da Sessão</DialogTitle>
          <DialogDescription>
            {format(new Date(appt.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-background/50 p-4 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Com quem</p>
            <p className="font-medium text-lg">{roleName || 'Desconhecido'}</p>
          </div>
          <div className="bg-background/50 p-4 rounded-xl border border-border/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-medium capitalize">{appt.status}</p>
            </div>
            {appt.status === 'scheduled' && (
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            )}
            {appt.status === 'cancelled' && (
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            )}
            {appt.status === 'completed' && <div className="w-3 h-3 rounded-full bg-green-500" />}
          </div>
          {appt.cancel_reason && (
            <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-destructive-foreground">
              <p className="text-sm font-medium mb-1">Motivo do Cancelamento</p>
              <p className="text-sm">{appt.cancel_reason}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Fechar
          </Button>
          {isFuture && isScheduled && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-full"
            >
              Cancelar Sessão
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
