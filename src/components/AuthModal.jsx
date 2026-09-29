import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Loader2, User, Briefcase } from 'lucide-react'

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState('client') // 'client' ou 'professional'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isSignUp) {
        // 1. Criar utilizador no Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          // 2. Guardar perfil com a role selecionada
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            role: role,
            email: email,
          })

          alert('Conta criada com sucesso!')
          onAuthSuccess(data.user)
          onClose()
        }
      } else {
        // Login simples
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          onAuthSuccess(data.user)
          onClose()
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocorreu um erro ao autenticar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black uppercase text-white mb-1">
          {isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          {isSignUp ? 'Escolha o tipo de conta para prosseguir' : 'Introduza os seus dados de acesso'}
        </p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              {/* Seleção de Tipo de Conta (Cliente vs Profissional) */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    role === 'client' 
                      ? 'bg-[#00a884] text-black border-[#00a884]' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Sou Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('professional')}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    role === 'professional' 
                      ? 'bg-[#eab308] text-black border-[#eab308]' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Sou Profissional</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Palavra-passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full font-black uppercase text-xs py-3 rounded transition flex items-center justify-center gap-2 cursor-pointer ${
              role === 'client' && isSignUp 
                ? 'bg-[#00a884] text-black hover:bg-[#008f70]' 
                : 'bg-[#eab308] text-black hover:bg-yellow-500'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? 'Criar Minha Conta' : 'Entrar')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-neutral-400 hover:text-white transition underline cursor-pointer"
          >
            {isSignUp ? 'Já tem conta? Iniciar sessão' : 'Não tem conta? Registe-se'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal;