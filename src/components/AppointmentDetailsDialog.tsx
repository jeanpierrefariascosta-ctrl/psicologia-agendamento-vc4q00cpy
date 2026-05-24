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
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AppointmentDetailsDialog({
  open,
  setOpen,
  appointment,
}: {
  open: boolean
  setOpen: (o: boolean) => void
  appointment: any
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [reason, setReason] = useState('')

  if (!appointment) return null

  const otherUser =
    user.role === 'psychologist' ? appointment.expand?.patient : appointment.expand?.psychologist
  const startTime = parseISO(appointment.start_time)

  const handleUpdateStatus = async (status: string) => {
    if (status === 'cancelled' && !reason.trim()) {
      toast.error('Informe o motivo do cancelamento.')
      return
    }
    setLoading(true)
    try {
      await pb.collection('appointments').update(appointment.id, { status, cancel_reason: reason })
      toast.success(status === 'cancelled' ? 'Agendamento cancelado.' : 'Sessão concluída.')
      setOpen(false)
      setIsCanceling(false)
      setReason('')
    } catch (e) {
      toast.error('Erro ao atualizar agendamento.')
    }
    setLoading(false)
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    scheduled: {
      label: 'Agendado',
      color: 'bg-primary text-primary-foreground hover:bg-primary/80',
    },
    completed: {
      label: 'Concluído',
      color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    cancelled: {
      label: 'Cancelado',
      color: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent',
    },
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) setIsCanceling(false)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Detalhes da Sessão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Data e Hora</p>
              <p className="font-medium">
                {format(startTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <Badge className={statusMap[appointment.status]?.color} variant="outline">
              {statusMap[appointment.status]?.label}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {user.role === 'psychologist' ? 'Paciente' : 'Psicóloga(o)'}
            </p>
            <p className="font-medium">{otherUser?.name || 'Usuário desconhecido'}</p>
          </div>

          {appointment.status === 'cancelled' && appointment.cancel_reason && (
            <div className="bg-destructive/5 p-3 rounded-md">
              <p className="text-xs text-destructive font-semibold mb-1">Motivo do cancelamento:</p>
              <p className="text-sm">{appointment.cancel_reason}</p>
            </div>
          )}

          {isCanceling && (
            <div className="space-y-2 pt-4 border-t animate-in fade-in zoom-in-95">
              <p className="text-sm font-medium">Motivo do cancelamento</p>
              <Textarea
                placeholder="Descreva brevemente o motivo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none bg-muted/50"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          {!isCanceling ? (
            <>
              {appointment.status === 'scheduled' && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-transparent sm:mr-auto"
                    onClick={() => setIsCanceling(true)}
                  >
                    Cancelar Consulta
                  </Button>
                  {user.role === 'psychologist' && (
                    <Button onClick={() => handleUpdateStatus('completed')} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Marcar como
                      Concluída
                    </Button>
                  )}
                </>
              )}
              {appointment.status !== 'scheduled' && (
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsCanceling(false)} disabled={loading}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar
                Cancelamento
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
