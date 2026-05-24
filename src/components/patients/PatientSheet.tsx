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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createPatient, updatePatient } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Download, File } from 'lucide-react'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

export function PatientSheet({ open, onOpenChange, patient, onSaved }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [anamnesis, setAnamnesis] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      setName(patient?.name || '')
      setEmail(patient?.email || '')
      setPhone(patient?.phone || '')
      setPassword('')
      setAnamnesis(patient?.anamnesis || '')
      setFiles([])
      setFieldErrors({})
    }
  }, [open, patient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('phone', phone)
    formData.append('anamnesis', anamnesis)

    if (!patient) {
      formData.append('password', password)
      formData.append('passwordConfirm', password)
      formData.append('role', 'patient')
    } else if (password) {
      formData.append('password', password)
      formData.append('passwordConfirm', password)
    }

    if (patient?.documents && patient.documents.length > 0) {
      patient.documents.forEach((doc: string) => {
        formData.append('documents', doc)
      })
    }

    files.forEach((f) => {
      formData.append('documents', f)
    })

    try {
      if (patient) {
        await updatePatient(patient.id, formData)
        toast({ title: 'Paciente atualizado!' })
      } else {
        await createPatient(formData)
        toast({ title: 'Paciente criado!' })
      }
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      const errors = extractFieldErrors(err)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        toast({ title: 'Corrija os erros no formulário.', variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col glass p-0 border-l border-border/50">
        <SheetHeader className="p-6 pb-4 border-b border-border/50 bg-background/50">
          <SheetTitle className="font-serif text-2xl text-primary">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </SheetTitle>
          <SheetDescription>
            {patient
              ? 'Atualize os dados e prontuário do paciente.'
              : 'Preencha os dados para registrar um novo paciente.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <form id="patient-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground/80">Dados Pessoais</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    {patient ? 'Nova Senha (opcional)' : 'Senha de Acesso (obrigatório)'}
                  </Label>
                  <Input
                    required={!patient}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-medium text-foreground/80">Prontuário (Anamnese)</h3>
              <div className="space-y-2">
                <Label>Observações Clínicas</Label>
                <Textarea
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  className="min-h-[150px] resize-none bg-background/50"
                  placeholder="Histórico familiar, sintomas, desenvolvimento do caso..."
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-lg font-medium text-foreground/80">Documentos</h3>

              {patient?.documents && patient.documents.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label className="text-xs text-muted-foreground">Arquivos Salvos</Label>
                  <div className="grid gap-2">
                    {patient.documents.map((doc: string) => (
                      <a
                        key={doc}
                        href={pb.files.getURL(patient, doc)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors text-sm"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <File className="h-4 w-4 text-primary" />
                        </div>
                        <span className="flex-1 truncate font-medium">{doc}</span>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Anexar Novos Arquivos (PDF, Imagens)</Label>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,image/*,.doc,.docx"
                  className="bg-background/50"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files))
                    }
                  }}
                />
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {files.length} arquivo(s) selecionado(s) para upload.
                  </p>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-border/50 bg-background/50">
          <Button
            type="submit"
            form="patient-form"
            className="w-full sm:w-auto rounded-full px-8"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Paciente'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
