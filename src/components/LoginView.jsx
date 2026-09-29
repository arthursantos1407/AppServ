import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, Loader2 } from 'lucide-react'

export function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('E-mail ou senha inválidos.')
      setLoading(false)
    } else {
      onLoginSuccess(data.user)
    }
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-[#18181b] border border-neutral-800 rounded-lg text-white">
      <div className="flex items-center gap-3 mb-6">
        <LogIn className="w-6 h-6 text-[#eab308]" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Área do Profissional</h2>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs mb-4 font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">E-mail</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm text-white focus:outline-none focus:border-[#eab308]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Senha</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm text-white focus:outline-none focus:border-[#eab308]"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs py-3 rounded transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar no Painel'}
        </button>
      </form>
    </div>
  )
}