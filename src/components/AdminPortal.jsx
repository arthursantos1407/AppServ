import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  ShieldCheck, Clock, CheckCircle2, XCircle, Copy, Check, 
  Loader2, DollarSign, Filter, ArrowLeft, LogOut, Wallet, RefreshCw
} from 'lucide-react'

export function AdminPortal({ onGoToPublicSite, onLogout }) {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDENTE') // 'TODOS' | 'PENDENTE' | 'PAGO' | 'CANCELADO'
  const [copiedId, setCopiedId] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    setLoading(true)
    try {
      // 1. Procura as solicitações na tabela 'withdrawals'
      const { data: withdrawData, error: withdrawError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false })

      if (withdrawError) throw withdrawError

      if (withdrawData && withdrawData.length > 0) {
        // 2. Procura os dados dos perfis associados
        const profIds = [...new Set(withdrawData.map(w => w.professional_id))]
        const { data: profsData } = await supabase
          .from('profiles')
          .select('id, full_name, email, category')
          .in('id', profIds)

        const profsMap = (profsData || []).reduce((acc, p) => {
          acc[p.id] = p
          return acc
        }, {})

        // 3. Combina as informações
        const formatted = withdrawData.map(w => ({
          ...w,
          professional: profsMap[w.professional_id] || { full_name: 'Profissional', email: 'Sem e-mail', category: 'Geral' }
        }))

        setWithdrawals(formatted)
      } else {
        setWithdrawals([])
      }
    } catch (err) {
      console.error('Erro ao carregar solicitações de saque:', err)
    } finally {
      setLoading(false)
    }
  }

  // Copiar chave Pix para a área de transferência
  const handleCopyPix = (pixKey, id) => {
    navigator.clipboard.writeText(pixKey)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Marcar saque como PAGO
  const handleMarkAsPaid = async (withdrawalId) => {
    setProcessingId(withdrawalId)
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'PAGO' })
        .eq('id', withdrawalId)

      if (error) throw error

      await loadWithdrawals()
    } catch (err) {
      alert(`Erro ao atualizar saque: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // Cancelar saque e estornar saldo para o profissional
  const handleCancelWithdrawal = async (withdrawal) => {
    if (!confirm(`Deseja cancelar o saque de R$ ${withdrawal.amount.toFixed(2)} e devolver o saldo ao profissional?`)) {
      return
    }

    setProcessingId(withdrawal.id)
    try {
      // 1. Atualiza o status do saque para CANCELADO
      const { error: withdrawError } = await supabase
        .from('withdrawals')
        .update({ status: 'CANCELADO' })
        .eq('id', withdrawal.id)

      if (withdrawError) throw withdrawError

      // 2. Procura a carteira atual do profissional
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('professional_id', withdrawal.professional_id)
        .maybeSingle()

      const currentAvailable = parseFloat(walletData?.available_balance || 0)
      const refundAmount = parseFloat(withdrawal.amount || 0)

      // 3. Estorna o valor de volta para o saldo disponível
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          available_balance: currentAvailable + refundAmount,
          updated_at: new Date().toISOString()
        })
        .eq('professional_id', withdrawal.professional_id)

      if (walletError) throw walletError

      await loadWithdrawals()
    } catch (err) {
      alert(`Erro ao cancelar saque: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // Cálculos das estatísticas
  const totalPendingAmount = withdrawals
    .filter(w => w.status === 'PENDENTE')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)

  const totalPaidAmount = withdrawals
    .filter(w => w.status === 'PAGO')
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0)

  const pendingCount = withdrawals.filter(w => w.status === 'PENDENTE').length

  // Filtragem da lista
  const filteredWithdrawals = withdrawals.filter(w => {
    if (filterStatus === 'TODOS') return true
    return w.status === filterStatus
  })

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      
      {/* Cabeçalho Admin */}
      <header className="bg-[#18181b] border-b border-neutral-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#eab308] text-black p-2 rounded-lg font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-wider uppercase flex items-center gap-2">
                PAINEL ADMINISTRATIVO
                <span className="bg-[#eab308]/20 text-[#eab308] text-[10px] px-2 py-0.5 rounded border border-[#eab308]/30 font-bold">ADMIN</span>
              </h1>
              <p className="text-xs text-neutral-400">Gestão de transferências Pix e solicitações de saques</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={loadWithdrawals}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-2 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00a884]' : ''}`} /> Atualizar
            </button>

            {onGoToPublicSite && (
              <button 
                onClick={onGoToPublicSite}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Site
              </button>
            )}

            {onLogout && (
              <button 
                onClick={onLogout}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* CARDS DE RESUMO/ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-[#18181b] border border-amber-500/30 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Saques Pendentes
              </span>
              <span className="bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded font-black text-[10px]">
                {pendingCount} solicitações
              </span>
            </div>
            <div className="text-3xl font-black text-white">
              R$ {totalPendingAmount.toFixed(2)}
            </div>
            <p className="text-[11px] text-neutral-400">Aguardando transferência via Pix manual.</p>
          </div>

          <div className="bg-[#18181b] border border-emerald-500/30 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Total Pago
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black text-[10px]">
                Concluídos
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400">
              R$ {totalPaidAmount.toFixed(2)}
            </div>
            <p className="text-[11px] text-neutral-400">Total acumulado de transferências efetuadas.</p>
          </div>

          <div className="bg-[#18181b] border border-neutral-800 rounded-xl p-5 space-y-2 relative">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#eab308]" />
                Registos Totais
              </span>
            </div>
            <div className="text-3xl font-black text-white">
              {withdrawals.length}
            </div>
            <p className="text-[11px] text-neutral-400">Histórico total de saques na plataforma.</p>
          </div>

        </div>

        {/* BARRA DE FILTROS E TÍTULO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Solicitações de Saque</h2>
            <p className="text-xs text-neutral-400">Gerencie os pagamentos dos profissionais cadastrados</p>
          </div>

          {/* Botões de Filtro */}
          <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-neutral-800 text-xs font-bold">
            {['PENDENTE', 'PAGO', 'CANCELADO', 'TODOS'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#00a884] text-black font-extrabold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA DE SAQUES */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
            <span className="text-sm">Carregando dados das solicitações...</span>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="bg-[#18181b] border border-neutral-800 p-12 text-center rounded-2xl space-y-2">
            <DollarSign className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 font-medium text-sm">
              Nenhuma solicitação encontrada com o status <strong className="text-white">"{filterStatus}"</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWithdrawals.map((item) => {
              const profName = item.professional?.full_name || 'Profissional Desconhecido'
              const profEmail = item.professional?.email || 'Sem e-mail'
              const profCategory = item.professional?.category || 'Sem Categoria'
              const isProcessing = processingId === item.id
              const isCopied = copiedId === item.id

              return (
                <div 
                  key={item.id}
                  className="bg-[#18181b] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 transition shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  {/* Informações do Profissional & Pedido */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                        item.status === 'PAGO'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'CANCELADO'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {profName}
                        <span className="text-xs text-[#eab308] font-semibold bg-yellow-500/10 px-2 py-0.5 rounded">
                          {profCategory}
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">{profEmail}</p>
                    </div>

                    {/* Detalhes do Pix */}
                    <div className="bg-[#0b141a] border border-neutral-800 rounded-xl p-3 inline-flex flex-wrap items-center gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase font-bold">Tipo</span>
                        <span className="text-neutral-200 font-semibold">{item.pix_type}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-neutral-800" />
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase font-bold">Chave Pix</span>
                        <span className="font-mono text-emerald-400 font-bold">{item.pix_key}</span>
                      </div>
                      <button
                        onClick={() => handleCopyPix(item.pix_key, item.id)}
                        className="ml-auto bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Pix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Valor e Ações de Aprovação */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-neutral-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-neutral-500 uppercase block font-bold">Valor a Transferir</span>
                      <span className="text-2xl font-black text-[#00a884]">
                        R$ {parseFloat(item.amount || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    {item.status === 'PENDENTE' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleCancelWithdrawal(item)}
                          className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Recusar</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => handleMarkAsPaid(item.id)}
                          className="flex-1 sm:flex-none bg-[#00a884] hover:bg-[#008f70] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#00a884]/10 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Marcar Pago</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {item.status === 'PAGO' && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Pago via Pix
                      </span>
                    )}

                    {item.status === 'CANCELADO' && (
                      <span className="text-xs text-red-400 font-bold flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <XCircle className="w-4 h-4" /> Recusado e Estornado
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

    </div>
  )
}

export default AdminPortal