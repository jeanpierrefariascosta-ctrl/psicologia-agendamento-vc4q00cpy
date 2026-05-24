import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const { signIn, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Credenciais inválidas.',
        variant: 'destructive',
      })
    }
  }

  const fillDemo = (role: 'psychologist' | 'patient') => {
    setEmail(role === 'psychologist' ? 'jpierre_costa@hotmail.com' : 'patient_demo@example.com')
    setPassword('Skip@Pass')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md glass border-border/50 shadow-elevation relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <span className="text-primary font-serif text-2xl font-bold">~</span>
          </div>
          <CardTitle className="text-3xl font-serif text-primary">Sereno</CardTitle>
          <CardDescription>Acesse seu espaço de bem-estar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full h-12 text-md transition-transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/register" className="text-primary hover:underline font-medium">
              É psicólogo e não tem conta? Cadastre-se
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground mb-4 font-medium uppercase tracking-wider">
              Contas de Demonstração
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('psychologist')}
                className="text-xs rounded-full"
              >
                Psicóloga
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemo('patient')}
                className="text-xs rounded-full"
              >
                Paciente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
