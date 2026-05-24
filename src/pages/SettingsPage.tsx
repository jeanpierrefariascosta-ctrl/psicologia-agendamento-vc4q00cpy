import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notifications_enabled ?? false,
  )

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [specialties, setSpecialties] = useState<string>('')

  useEffect(() => {
    if (user?.specialties) {
      try {
        const specs =
          typeof user.specialties === 'string' ? JSON.parse(user.specialties) : user.specialties
        setSpecialties(Array.isArray(specs) ? specs.join(', ') : specs)
      } catch (e) {
        setSpecialties(typeof user.specialties === 'string' ? user.specialties : '')
      }
    }

    setNotificationsEnabled(user?.notifications_enabled ?? false)
  }, [user])

  const handleNotificationToggle = async (checked: boolean) => {
    const previousState = notificationsEnabled
    setNotificationsEnabled(checked)

    try {
      if (checked && 'Notification' in window && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setNotificationsEnabled(false)
          toast({
            title: 'Permissão para notificações foi negada pelo navegador.',
            variant: 'destructive',
          })
          return
        }
      }

      if (user?.id) {
        await pb.collection('users').update(user.id, { notifications_enabled: checked })
      }
      toast({ title: checked ? 'Notificações ativadas' : 'Notificações desativadas' })
    } catch (err: any) {
      setNotificationsEnabled(previousState)
      toast({
        title: 'Erro ao salvar preferência',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, insira um e-mail válido.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const data: any = { name, email, phone }

      if (user.role === 'psychologist') {
        data.bio = bio
        const specsArray = specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        data.specialties = JSON.stringify(specsArray)
      }

      await pb.collection('users').update(user.id, data)
      toast({ title: 'Configurações salvas com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-primary">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e preferências.</p>
      </div>

      <div className="glass rounded-2xl p-6 shadow-sm border border-border/50">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-border/50 pb-2">
              Informações Pessoais
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {user?.role === 'psychologist' && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium border-b border-border/50 pb-2">
                Perfil Profissional
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Especialidades (separadas por vírgula)</Label>
                  <Input
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder="Ex: Terapia Cognitivo Comportamental, Psicanálise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biografia</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Fale um pouco sobre você e sua experiência..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium border-b border-border/50 pb-2">Preferências</h3>
            <div className="flex items-center justify-between bg-background/50 p-4 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base">Notificações no Navegador</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre novos agendamentos e mensagens.
                </p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="rounded-full px-8">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
