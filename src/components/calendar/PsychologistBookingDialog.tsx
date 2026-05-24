import { useState, useEffect } from 'react'
import { addWeeks, format, isBefore } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { createAppointment, getPatients, createPatient } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PsychologistBookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing')

  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientEmail, setNewPatientEmail] = useState('')

  const [frequency, setFrequency] = useState<'single' | 'weekly' | 'bi-weekly'>('single')
  const [startDate, setStartDate] = useState('')
  const [time, setTime] = useState('09:00')

  useEffect(() => {
    if (open) loadPatients()
  }, [open])

  const loadPatients = async () => {
    try {
      const data = await getPatients()
      setPatients(data)
    } catch {
      /* intentionally ignored */
    }
  }

  const handleBook = async () => {
    if (!startDate || !time) {
      return toast({ title: 'Preencha data e hora', variant: 'destructive' })
    }

    setLoading(true)
    try {
      let patientId = selectedPatientId

      if (patientMode === 'new') {
        if (!newPatientName || !newPatientEmail) {
          throw new Error('Preencha nome e email do paciente.')
        }
        const newPatient = await createPatient({
          name: newPatientName,
          email: newPatientEmail,
          password: 'Password@123',
        })
        patientId = newPatient.id
        await loadPatients()
      }

      if (!patientId) throw new Error('Selecione um paciente.')

      const [hours, minutes] = time.split(':').map(Number)
      const start = new Date(startDate)
      start.setHours(hours, minutes, 0, 0)

      if (isBefore(start, new Date())) {
        throw new Error('Não é possível agendar no passado.')
      }

      const appointmentsToCreate = []
      let currentDate = start

      const occurrences = frequency === 'single' ? 1 : frequency === 'weekly' ? 12 : 6

      for (let i = 0; i < occurrences; i++) {
        const end = new Date(currentDate)
        end.setHours(currentDate.getHours() + 1)

        appointmentsToCreate.push({
          psychologist: user?.id,
          patient: patientId,
          start_time: currentDate.toISOString(),
          end_time: end.toISOString(),
          status: 'scheduled',
        })

        if (frequency === 'weekly') {
          currentDate = addWeeks(currentDate, 1)
        } else if (frequency === 'bi-weekly') {
          currentDate = addWeeks(currentDate, 2)
        }
      }

      await Promise.all(appointmentsToCreate.map((data) => createAppointment(data)))

      toast({
        title: frequency === 'single' ? 'Sessão agendada!' : `${occurrences} sessões agendadas!`,
      })
      onOpenChange(false)
      resetForm()
    } catch (e: any) {
      toast({ title: 'Erro ao agendar', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPatientMode('existing')
    setSelectedPatientId('')
    setNewPatientName('')
    setNewPatientEmail('')
    setFrequency('single')
    setStartDate('')
    setTime('09:00')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[500px] glass">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            Agendamento Avançado
          </DialogTitle>
          <DialogDescription>
            Crie uma sessão única ou recorrente para um paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Tabs value={patientMode} onValueChange={(v: any) => setPatientMode(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Paciente Existente</TabsTrigger>
              <TabsTrigger value="new">Novo Paciente</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-2 mt-4">
              <Label>Selecionar Paciente</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do Paciente</Label>
                <Input
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail do Paciente</Label>
                <Input
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                  type="email"
                  placeholder="joao@exemplo.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A senha padrão será <strong>Password@123</strong>
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label>Frequência</Label>
            <RadioGroup
              value={frequency}
              onValueChange={(v: any) => setFrequency(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="r1" />
                <Label htmlFor="r1">Única</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="r2" />
                <Label htmlFor="r2">Semanal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bi-weekly" id="r3" />
                <Label htmlFor="r3">Quinzenal</Label>
              </div>
            </RadioGroup>
            {frequency !== 'single' && (
              <p className="text-xs text-muted-foreground">
                Agendará sessões pelos próximos 3 meses.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step="3600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleBook} disabled={loading}>
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
