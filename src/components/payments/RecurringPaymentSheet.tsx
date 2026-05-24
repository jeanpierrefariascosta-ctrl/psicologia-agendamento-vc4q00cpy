import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPatients, createRecurringPayment } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function RecurringPaymentSheet({ open, onOpenChange, onSaved }: any) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<any[]>([])

  const [patientId, setPatientId] = useState('')
  const [planName, setPlanName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      getPatients().then(setPatients).catch(console.error)
      setPatientId('')
      setPlanName('')
      setAmount('')
      setFrequency('monthly')
      setNextBillingDate('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createRecurringPayment({
        patient: patientId,
        psychologist: user?.id,
        plan_name: planName,
        amount: Number(amount),
        frequency,
        next_billing_date: new Date(nextBillingDate).toISOString(),
        active: true,
      })
      toast({ title: 'Pagamento recorrente criado com sucesso!' })
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col glass p-0 border-l border-border/50">
        <SheetHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <SheetTitle className="font-serif text-2xl text-primary">
            Novo Pagamento Recorrente
          </SheetTitle>
          <SheetDescription>Configure uma cobrança automática para um paciente.</SheetDescription>
        </SheetHeader>
        <div className="p-6 flex-1 overflow-y-auto">
          <form id="recurring-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId} required>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione um paciente..." />
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
              <Label>Nome do Plano</Label>
              <Input
                required
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Sessões Semanais de Terapia"
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background/50"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência de Cobrança</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="bi_weekly">Quinzenal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data do Primeiro Faturamento</Label>
              <Input
                required
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </form>
        </div>
        <SheetFooter className="p-6 border-t border-border/50 bg-background/50">
          <Button
            type="submit"
            form="recurring-form"
            className="w-full sm:w-auto rounded-full px-8"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Criar Pagamento'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
