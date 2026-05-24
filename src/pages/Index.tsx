import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getAppointments,
  getPayments,
  updatePayment,
  createPayment,
  getPatients,
} from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, isThisMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Calendar, DollarSign, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export default function Index() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    patient: '',
    plan_name: '',
    amount: '',
    due_date: '',
    status: 'pending',
  })

  const loadData = async () => {
    try {
      const [appts, pyts] = await Promise.all([getAppointments(), getPayments()])
      setAppointments(appts)
      setPayments(pyts)
      if (user?.role === 'psychologist' || user?.role === 'admin') {
        const pts = await getPatients()
        setPatients(pts)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('appointments', () => {
    loadData()
  })
  useRealtime('payments', () => {
    loadData()
  })

  const upcomingAppts = appointments.filter(
    (a) => new Date(a.start_time) > new Date() && a.status === 'scheduled',
  )
  const sessionsThisMonth = appointments.filter((a) => isThisMonth(new Date(a.start_time))).length

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPayment({
        ...newPayment,
        due_date: newPayment.due_date + ' 12:00:00',
        amount: Number(newPayment.amount),
      })
      toast({ title: 'Pagamento registrado com sucesso' })
      setIsPaymentModalOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao registrar pagamento', variant: 'destructive' })
    }
  }

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      await updatePayment(id, { status })
      toast({ title: 'Status atualizado' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-600'
      case 'overdue':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-yellow-500/10 text-yellow-600'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'overdue':
        return 'Atrasado'
      default:
        return 'Pendente'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a) ao Sereno, seu espaço de bem-estar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessões neste Mês</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Total de consultas agendadas e concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppts.length}</div>
            <p className="text-xs text-muted-foreground">Agendadas e não realizadas</p>
          </CardContent>
        </Card>

        {(user?.role === 'psychologist' || user?.role === 'admin') && (
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter((p) => p.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando recebimento</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass border-border/50 col-span-1">
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Suas sessões agendadas mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppts.slice(0, 5).map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {user?.role === 'psychologist'
                        ? appt.expand?.patient?.name
                        : appt.expand?.psychologist?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(appt.start_time), "dd 'de' MMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {appt.status}
                  </Badge>
                </div>
              ))}
              {upcomingAppts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma sessão agendada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico Financeiro</CardTitle>
              <CardDescription>Acompanhamento de pagamentos</CardDescription>
            </div>
            {(user?.role === 'psychologist' || user?.role === 'admin') && (
              <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <Plus className="w-4 h-4 mr-1" /> Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-border/50">
                  <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Paciente</Label>
                      <Select
                        value={newPayment.patient}
                        onValueChange={(v) => setNewPayment({ ...newPayment, patient: v })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
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
                      <Label>Plano / Descrição</Label>
                      <Input
                        value={newPayment.plan_name}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, plan_name: e.target.value })
                        }
                        required
                        placeholder="Ex: Mensalidade, Sessão Avulsa"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimento</Label>
                        <Input
                          type="date"
                          value={newPayment.due_date}
                          onChange={(e) =>
                            setNewPayment({ ...newPayment, due_date: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Status Inicial</Label>
                      <Select
                        value={newPayment.status}
                        onValueChange={(v) => setNewPayment({ ...newPayment, status: v })}
                      >
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
                    <Button type="submit" className="w-full rounded-full">
                      Salvar Pagamento
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(user?.role === 'psychologist' || user?.role === 'admin') && (
                    <TableHead>Paciente</TableHead>
                  )}
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Venc.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 5).map((payment) => (
                  <TableRow key={payment.id}>
                    {(user?.role === 'psychologist' || user?.role === 'admin') && (
                      <TableCell className="font-medium whitespace-nowrap">
                        {payment.expand?.patient?.name}
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap">{payment.plan_name}</TableCell>
                    <TableCell>R$ {payment.amount}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(parseISO(payment.due_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {user?.role === 'psychologist' || user?.role === 'admin' ? (
                        <Select
                          value={payment.status}
                          onValueChange={(v) => handleUpdatePaymentStatus(payment.id, v)}
                        >
                          <SelectTrigger
                            className={`h-7 text-xs border-0 ${statusColor(payment.status)} rounded-full w-[110px]`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="overdue">Atrasado</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          className={`${statusColor(payment.status)} bg-opacity-10`}
                          variant="outline"
                        >
                          {statusLabel(payment.status)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      Nenhum pagamento registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
