import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Lock, Mail, Loader2, ArrowRight, Sparkles, CheckCircle2, UserPlus } from 'lucide-react'

export default function Login({ onLogin }) {
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (authError) throw authError

                setSuccess(true)
                setTimeout(() => {
                    onLogin(data.user)
                }, 1000)
            } else {
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'manager'
                        }
                    }
                })
                if (authError) throw authError

                if (data.user && !data.session) {
                    setError('Cadastro realizado. Verifique seu e-mail para confirmar a conta.')
                    setIsLogin(true)
                } else if (data.session) {
                    setSuccess(true)
                    setTimeout(() => {
                        onLogin(data.user)
                    }, 1000)
                }
            }
        } catch (err) {
            let message = err.message
            if (message === 'Invalid login credentials') message = 'E-mail ou senha incorretos'
            if (message === 'User already registered') message = 'Este e-mail já está cadastrado'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1D4ED8]/5 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1D4ED8]/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center p-4 bg-[#1D4ED8] rounded-[2rem] shadow-2xl shadow-[#1D4ED8]/30 mb-6 group transition-transform hover:scale-110">
                        {isLogin ? <Lock size={32} className="text-white" /> : <UserPlus size={32} className="text-white" />}
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        Pegue<span className="text-[#1D4ED8]">e</span>Monte
                    </h1>
                    <p className="text-[#94A3B8] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
                        {isLogin ? 'Sistema de Gestão de Acervo' : 'Crie sua conta de administrador'}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#161B22] p-10 rounded-[3rem] border border-[#1E293B] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1D4ED8] to-transparent opacity-50" />

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">E-mail de Acesso</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all placeholder:text-[#64748B] placeholder:font-bold"
                                    placeholder="exemplo@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-[#1E293B] rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-[#1D4ED8]/50 transition-all placeholder:text-[#64748B] placeholder:font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className={`p-4 border rounded-2xl animate-in shake duration-300 ${error.includes('Verifique seu e-mail') ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <p className={`text-xs font-bold text-center ${error.includes('Verifique seu e-mail') ? 'text-blue-500' : 'text-red-500'}`}>{error}</p>
                            </div>
                        )}

                        <button
                            disabled={loading || success}
                            type="submit"
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                                ${success
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white shadow-lg shadow-[#1D4ED8]/20 hover:translate-y-[-2px] active:translate-y-[0px]'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : success ? (
                                <>
                                    <CheckCircle2 size={20} />
                                    {isLogin ? 'Acesso Autorizado' : 'Conta Criada'}
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Entrar no Sistema' : 'Cadastrar agora'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#1E293B] text-center space-y-4">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Faça login'}
                        </button>

                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Sparkles size={12} className="text-[#1D4ED8]" />
                            Segurança Supabase Auth
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">
                    © 2024 Pegue e Monte • Design Premium
                </p>
            </div>
        </div>
    )
}
