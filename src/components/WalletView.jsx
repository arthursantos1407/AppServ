import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, Clock, CheckCircle, ArrowDownCircle } from 'lucide-react'

export function WalletView({ professionalId }) {
  const [wallet, setWallet] = useState({ pending_balance: 0, available_balance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (professionalId) {
      loadWallet()
    }
  }, [professionalId])

  const loadWallet = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('professional_id', professionalId)
      .single()

    if (data) setWallet(data)
    setLoading(false)
  }

  const handleWithdrawRequest = () => {
    if (parseFloat(wallet.available_balance) <= 0) {
      return alert('Não possui saldo disponível para resgate.')
    }
    alert(`Solicitação de saque de R$ ${parseFloat(wallet.available_balance).toFixed(2)} enviada! O valor será transferido para a sua conta em até 24h.`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <Wallet className="w-8 h-8 text-[#eab308]" />
        <div>
          <h1 className="text-2xl font-black">Minha Carteira</h1>
          <p className="text-xs text-neutral-400">Acompanhe os seus ganhos e solicite saques dos serviços concluídos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Saldo Pendente (Custódia) */}
        <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold">
            <span>SALDO PENDENTE (CUSTÓDIA)</span>
            <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-white">
            R$ {parseFloat(wallet.pending_balance || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-500">
            Serviços pagos pelo cliente aguardando a confirmação de conclusão.
          </p>
        </div>

        {/* Saldo Disponível (Liberado) */}
        <div className="bg-[#18181b] border border-[#00a884]/30 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>SALDO DISPONÍVEL</span>
            <CheckCircle className="w-4 h-4 text-[#00a884]" />
          </div>
          <p className="text-3xl font-black text-[#00a884]">
            R$ {parseFloat(wallet.available_balance || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-500">
            Valor pronto para ser transferido para a sua chave PIX.
          </p>
        </div>
      </div>

      <button
        onClick={handleWithdrawRequest}
        className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <ArrowDownCircle className="w-5 h-5" />
        Solicitar Resgate de Saldo
      </button>
    </div>
  )
}