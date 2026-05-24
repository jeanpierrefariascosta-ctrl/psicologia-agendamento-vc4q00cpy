import { useState, useEffect } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import { getPatients } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PatientSheet } from '@/components/patients/PatientSheet'
import { useAuth } from '@/hooks/use-auth'

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { user } = useAuth()

  const loadPatients = async () => {
    try {
      const data = await getPatients()
      setPatients(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const openNew = () => {
    setSelectedPatient(null)
    setIsSheetOpen(true)
  }

  const openEdit = (p: any) => {
    setSelectedPatient(p)
    setIsSheetOpen(true)
  }

  if (user?.role !== 'psychologist' && user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado. Apenas psicólogos podem acessar esta página.
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-primary">Pacientes</h2>
          <p className="text-muted-foreground">Gerencie seus pacientes, contatos e prontuários.</p>
        </div>
        <Button onClick={openNew} className="rounded-full shadow-sm w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pacientes por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md bg-background/50 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((patient) => (
          <Card
            key={patient.id}
            className="cursor-pointer hover:border-primary/50 transition-colors glass"
            onClick={() => openEdit(patient)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif">{patient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="truncate" title={patient.email}>
                  {patient.email}
                </p>
                {patient.phone && <p>{patient.phone}</p>}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/50 text-primary">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium">Ver Prontuário</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
            Nenhum paciente encontrado.
          </div>
        )}
      </div>

      <PatientSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        patient={selectedPatient}
        onSaved={loadPatients}
      />
    </div>
  )
}
