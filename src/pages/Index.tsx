import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  getAppointments,
  getPayments,
  createPayment,
  updatePayment,
  getPatients,
} from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PsychologistBookingDialog } from '@/components/calendar/PsychologistBookingDialog'
import { PatientBookingDialog } from '@/components/calendar/PatientBookingDialog'
import { AppointmentDetailsDialog } from '@/components/calendar/AppointmentDetailsDialog'
import { toast } from '@/hooks/use-toast'

export default function Index() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [patientBookingOpen, setPatientBookingOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const loadData = async () => {
    try {
      const [appts, pmts] = await Promise.all([getAppointments(), getPayments()])
      setAppointments(appts)
      setPayments(pmts)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('appointments', () => loadData())
  useRealtime('payments', () => loadData())

  const upcomingAppts = appointments.filter(
    (a) => new Date(a.start_time) >= new Date() && a.status === 'scheduled',
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Olá, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo(a) ao seu painel Sereno.</p>
        </div>
        {user?.role === 'psychologist' && (
          <Button onClick={() => setBookingOpen(true)} className="rounded-full shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        )}
        {user?.role === 'patient' && (
          <Button onClick={() => setPatientBookingOpen(true)} className="rounded-full shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Agendar Consulta
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agenda" className="w-full">
        <TabsList>
          <TabsTrigger value="agenda">Sua Agenda</TabsTrigger>
          {user?.role === 'psychologist' && <TabsTrigger value="payments">Pagamentos</TabsTrigger>}
        </TabsList>

        <TabsContent value="agenda" className="mt-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppts.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">Nenhuma sessão agendada.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppts.slice(0, 5).map((appt) => {
                    const otherUser =
                      user?.role === 'psychologist'
                        ? appt.expand?.patient
                        : appt.expand?.psychologist
                    const date = new Date(appt.start_time)
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelectedAppt(appt)
                          setDetailsOpen(true)
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{otherUser?.name || 'Desconhecido'}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          Agendado
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'psychologist' && (
          <TabsContent value="payments" className="mt-4">
            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Controle de Pagamentos</CardTitle>
                  <CardDescription>
                    Gerencie os planos e mensalidades dos pacientes.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPaymentDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Nenhum pagamento registrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.expand?.patient?.name}</TableCell>
                        <TableCell>{p.plan_name}</TableCell>
                        <TableCell>{format(new Date(p.due_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>R$ {p.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === 'paid'
                                ? 'default'
                                : p.status === 'overdue'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {p.status === 'paid'
                              ? 'Pago'
                              : p.status === 'overdue'
                                ? 'Atrasado'
                                : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updatePayment(p.id, { status: 'paid' }).then(loadData)}
                            >
                              Marcar Pago
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <PsychologistBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      <PatientBookingDialog
        open={patientBookingOpen}
        onOpenChange={setPatientBookingOpen}
        onSuccess={loadData}
      />
      <AppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appt={selectedAppt}
      />

      {user?.role === 'psychologist' && (
        <NewPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}

function NewPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: () => void
}) {
  const [patients, setPatients] = useState<any[]>([])
  const [patientId, setPatientId] = useState('')
  const [planName, setPlanName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open)
      getPatients()
        .then(setPatients)
        .catch(() => {})
  }, [open])

  const handleSave = async () => {
    if (!patientId || !planName || !amount || !dueDate) {
      return toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
    }
    setLoading(true)
    try {
      await createPayment({
        patient: patientId,
        plan_name: planName,
        amount: Number(amount),
        due_date: new Date(dueDate).toISOString(),
        status,
      })
      toast({ title: 'Pagamento registrado com sucesso!' })
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nome do Plano / Referência</Label>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Ex: Mensalidade - Outubro"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
