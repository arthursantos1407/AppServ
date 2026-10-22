import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function MercadoPagoCallback() {
  const [status, setStatus] = useState('processing') // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('A processar ligação com o Mercado Pago...')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const professionalId = params.get('state')

    if (!code || !professionalId) {
      setStatus('error')
      setMessage('Parâmetros de autorização inválidos ou ausentes.')
      return
    }

    try {
      // Chama a Edge Function do Supabase para trocar o code pelo access_token com segurança
      const { data, error } = await supabase.functions.invoke('mp-connect', {
        body: { code, professionalId }
      })

      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao conectar conta do Mercado Pago.')
      }

      setStatus('success')
      setMessage('Conta do Mercado Pago conectada com sucesso!')

      // Redireciona de volta para o painel após 3 segundos
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)

    } catch (err) {
      console.error('Erro no callback MP:', err)
      setStatus('error')
      setMessage(err.message || 'Falha ao concluir a autorização.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-[#00a884] animate-spin mx-auto" />
            <h3 className="text-lg font-bold">Conectando Conta...</h3>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-400">Conectado com Sucesso!</h3>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-red-400">Erro na Conexão</h3>
          </>
        )}

        <p className="text-xs text-neutral-400">{message}</p>

        {status !== 'processing' && (
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#00a884] text-black font-bold text-xs py-2.5 rounded-xl mt-4"
          >
            Voltar à Plataforma
          </button>
        )}
      </div>
    </div>
  )
}