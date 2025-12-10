import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export default function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState('cliente')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                const { error } = await signIn(email, password)
                if (error) throw error
                navigate('/menu')
            } else {
                const { error } = await signUp(email, password, { name, role })
                if (error) throw error
                navigate('/menu')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md animate-enter">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 mb-4 border border-white/5 backdrop-blur-xl">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-6xl font-extrabold bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-300 bg-clip-text text-transparent mb-2 tracking-tight">
                        Ejuem
                    </h1>
                    <p className="text-slate-400 text-lg font-light">Experiencia Gastronómica Premium</p>
                </div>

                <Card className="border-t border-white/10 glass-strong">
                    <div className="flex p-1 bg-slate-950/50 rounded-xl mb-8 border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${isLogin
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${!isLogin
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5 animate-enter">
                                <label className="text-sm font-medium text-slate-300 ml-1">
                                    Nombre Completo
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">
                                Correo Electrónico
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tucorreo@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">
                                Contraseña
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-1.5 animate-enter delay-100">
                                <label className="text-sm font-medium text-slate-300 ml-1">
                                    Tipo de Cuenta
                                </label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-950/30 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none hover:border-white/20 transition-colors"
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="mesero">Mesero</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-enter">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full mt-4 py-3 text-lg shadow-xl shadow-primary-500/20"
                        >
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <button
                            onClick={() => navigate('/menu')}
                            className="text-slate-400 hover:text-primary-400 text-sm transition-colors flex items-center justify-center gap-2 mx-auto group font-medium"
                        >
                            <span>Continuar como invitado</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
