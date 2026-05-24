import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getPayments, getRecurringPayments } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CreditCard, CalendarDays, Receipt } from 'lucide-react'
import { RecurringPaymentSheet } from '@/components/payments/RecurringPaymentSheet'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const { user } = useAuth()
  const isPsychologist = user?.role === 'psychologist' || user?.role === 'admin'
  const [payments, setPayments] = useState<any[]>([])
  const [recurring, setRecurring] = useState<any[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  const loadData = async () => {
    try {
      const p = await getPayments()
      setPayments(p)
      if (isPsychologist && user?.id) {
        const r = await getRecurringPayments(user.id)
        setRecurring(r)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie seus pagamentos e faturamentos</p>
        </div>
        {isPsychologist && (
          <Button onClick={() => setSheetOpen(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Pagamento Recorrente
          </Button>
        )}
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="payments" className="rounded-xl">
            Histórico de Pagamentos
          </TabsTrigger>
          {isPsychologist && (
            <TabsTrigger value="recurring" className="rounded-xl">
              Assinaturas Recorrentes
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <Card className="glass border-border/50">
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum pagamento registrado.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{p.plan_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isPsychologist && p.expand?.patient
                              ? p.expand.patient.name
                              : 'Seu plano'}{' '}
                            • Vencimento: {format(new Date(p.due_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-medium">R$ {p.amount.toFixed(2)}</p>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            p.status === 'paid'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : p.status === 'overdue'
                                ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {p.status === 'paid'
                            ? 'Pago'
                            : p.status === 'overdue'
                              ? 'Atrasado'
                              : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isPsychologist && (
          <TabsContent value="recurring" className="mt-6">
            <Card className="glass border-border/50">
              <CardContent className="p-0">
                {recurring.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma assinatura recorrente configurada.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {recurring.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{r.plan_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Paciente: {r.expand?.patient?.name} • Próxima cobrança:{' '}
                              {format(new Date(r.next_billing_date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {r.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground capitalize font-medium">
                            {r.frequency === 'weekly'
                              ? 'Semanal'
                              : r.frequency === 'bi_weekly'
                                ? 'Quinzenal'
                                : 'Mensal'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {isPsychologist && (
        <RecurringPaymentSheet open={sheetOpen} onOpenChange={setSheetOpen} onSaved={loadData} />
      )}
    </div>
  )
}
