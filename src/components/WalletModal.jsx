import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Wallet, ArrowDownCircle, Clock, CheckCircle2, AlertCircle, 
  X, Send, Loader2, Lock, ShieldCheck, Check, ExternalLink
} from 'lucide-react'

// SUBSTITUA PELOS SEUS DADOS DO MERCADO PAGO
const MP_CLIENT_ID = '7863490109007036'
const MP_REDIRECT_URI = window.location.origin + '/mp-callback'

export function WalletModal({ professionalId, onClose }) {
  const [wallet, setWallet] = useState({ pending_balance: 0, available_balance: 0 })
  const [profile, setProfile] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixType, setPixType] = useState('CPF')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    if (professionalId) {
      loadWalletData()
    }
  }, [professionalId])

  const loadWalletData = async () => {
    setLoading(true)
    try {
      // Carrega dados do perfil (para checar se o Mercado Pago está conectado)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('mp_connected, mp_user_id')
        .eq('id', professionalId)
        .maybeSingle()

      if (profileData) setProfile(profileData)

      // Carrega carteira
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('professional_id', professionalId)
        .maybeSingle()

      if (walletData) setWallet(walletData)

      // Carrega histórico de saques
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })

      if (withdrawalsData) setWithdrawals(withdrawalsData)

    } catch (err) {
      console.error('Erro ao carregar carteira:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectMercadoPago = () => {
    if (!MP_CLIENT_ID || MP_CLIENT_ID === 'O_SEU_CLIENT_ID_AQUI') {
      return setErrorMessage('Configure o MP_CLIENT_ID no ficheiro WalletModal.jsx')
    }

    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(MP_REDIRECT_URI)}&state=${professionalId}`
    window.location.href = authUrl
  }

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    const amountNum = parseFloat(withdrawAmount)
    const availableNum = parseFloat(wallet.available_balance || 0)

    if (isNaN(amountNum) || amountNum <= 0) {
      return setErrorMessage('Informe um valor de saque válido.')
    }

    if (amountNum > availableNum) {
      return setErrorMessage('Saldo disponível insuficiente para este valor.')
    }

    if (!pixKey.trim()) {
      return setErrorMessage('Informe a sua chave Pix para depósito.')
    }

    setSubmitting(true)

    try {
      // 1. Registra a solicitação na tabela withdrawals (Lida automaticamente pelo AdminPortal)
      const { error: withdrawError } = await supabase
        .from('withdrawals')
        .insert({
          professional_id: professionalId,
          amount: amountNum,
          pix_key: pixKey.trim(),
          pix_type: pixType,
          status: 'PENDENTE',
          created_at: new Date().toISOString()
        })

      if (withdrawError) throw withdrawError

      // 2. Atualiza o saldo disponível da carteira
      const newAvailableBalance = Math.max(0, availableNum - amountNum)
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ available_balance: newAvailableBalance })
        .eq('professional_id', professionalId)

      if (walletError) throw walletError

      setSuccessData({
        amount: amountNum,
        pixKey: pixKey.trim(),
        pixType: pixType
      })

      setWithdrawAmount('')
      setPixKey('')
      loadWalletData()

    } catch (err) {
      console.error('Erro no saque:', err)
      setErrorMessage(String(err?.message || 'Erro ao registrar solicitação de saque.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#18181b] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white relative">
        
        {/* Cabeçalho */}
        <div className="bg-[#202c33] px-5 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Minha Carteira & Saques</h3>
              <p className="text-xs text-neutral-400">Gerencie seus ganhos e recebimentos automáticos</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition p-2 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {loading ? (
            <div className="flex items-center justify-center py-12 text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a884]" />
              <span className="text-xs">Carregando dados da carteira...</span>
            </div>
          ) : successData ? (
            <div key="view-success" className="py-6 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#00a884]/10">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-white">Saque Solicitado com Sucesso!</h4>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  A sua solicitação foi enviada para processamento. O pagamento cairá na sua conta em <span className="text-[#00a884] font-bold">até 24 horas</span> após a aprovação.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 max-w-md mx-auto space-y-3 text-left text-xs">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Valor Solicitado:</span>
                  <span className="text-base font-extrabold text-[#00a884]">
                    R$ {parseFloat(successData.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Chave Pix ({successData.pixType}):</span>
                  <span className="font-mono text-white font-semibold">{successData.pixKey}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Estado do Pedido:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Em Análise
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="w-full max-w-md bg-[#00a884] hover:bg-[#008f70] text-black font-extrabold text-xs py-3.5 rounded-xl transition cursor-pointer shadow-lg mx-auto block"
              >
                Entendido / Voltar à Carteira
              </button>
            </div>
          ) : (
            <div key="view-form" className="space-y-6">

              {/* CARD DE LIGAÇÃO AO MERCADO PAGO */}
              {profile?.mp_connected ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-white font-bold">Conta Mercado Pago Conectada</p>
                      <p className="text-[11px] text-neutral-400 font-normal">
                        Os pagamentos de serviços efetuados por clientes caem automaticamente na sua conta.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-black px-2.5 py-1 rounded font-black uppercase shrink-0">
                    Ativo
                  </span>
                </div>
              ) : (
                <div className="bg-neutral-900 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-white">Receba pagamentos automaticamente</span>
                      <span className="text-neutral-400 text-[11px]">
                        Conecte a sua conta do Mercado Pago para receber o valor dos serviços contratados pelos clientes na hora, sem precisar solicitar saques manuais.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectMercadoPago}
                    className="w-full bg-[#009EE3] hover:bg-[#008ebb] text-white font-extrabold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Conectar Conta do Mercado Pago
                  </button>
                </div>
              )}

              {/* Cards de Saldo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Em Custódia
                    </span>
                    <span className="bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded text-[10px]">Aguardando Cliente</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    R$ {parseFloat(wallet.pending_balance || 0).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Ganhos de serviços em andamento.
                  </p>
                </div>

                <div className="bg-neutral-900 border border-[#00a884]/40 bg-gradient-to-br from-[#00a884]/10 to-transparent rounded-xl p-4 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs font-bold text-[#00a884]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Disponível para Saque
                    </span>
                    <span className="bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded text-[10px] font-extrabold">Liberado</span>
                  </div>
                  <div className="text-2xl font-black text-[#00a884]">
                    R$ {parseFloat(wallet.available_balance || 0).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Saldo residual disponível para transferência manual via Pix.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div key="err-alert" className="p-3 rounded-xl text-xs flex items-center gap-2 border bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Formulário de Saque */}
              <form onSubmit={handleRequestWithdrawal} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <ArrowDownCircle className="w-4 h-4 text-[#00a884]" />
                  Solicitar Transferência Pix
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Tipo de Chave Pix</label>
                    <select
                      value={pixType}
                      onChange={(e) => setPixType(e.target.value)}
                      className="w-full bg-[#111b21] border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
                    >
                      <option value="CPF">CPF</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="TELEFONE">Telefone</option>
                      <option value="CHAVE_ALEATORIA">Chave Aleatoria</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Chave Pix para Depósito</label>
                    <input
                      type="text"
                      required
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Cole ou digite sua chave Pix..."
                      className="w-full bg-[#111b21] border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Valor a Sacar (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Máximo: R$ ${parseFloat(wallet.available_balance || 0).toFixed(2)}`}
                      className="w-full bg-[#111b21] border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || parseFloat(wallet.available_balance || 0) <= 0}
                  className="w-full bg-[#00a884] hover:bg-[#008f70] disabled:opacity-50 text-black font-extrabold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? (
                    <span key="sub-loading" className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Processando transferência...</span>
                    </span>
                  ) : (
                    <span key="sub-idle" className="flex items-center gap-2">
                      <Send className="w-4 h-4 shrink-0" />
                      <span>Solicitar Saque Pix</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Histórico */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Histórico de Saques
                </h4>

                {withdrawals.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    Nenhuma solicitação de saque realizada ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {withdrawals.map((item, index) => (
                      <div 
                        key={item.id ? `w-item-${item.id}` : `w-idx-${index}`} 
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white">
                            R$ {parseFloat(item.amount || 0).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                            <span>Chave ({item.pix_type}): {item.pix_key}</span>
                            <span>•</span>
                            <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <div>
                          {item.status === 'PAGO' ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : item.status === 'CANCELADO' ? (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-md font-bold text-[10px]">
                              Recusado / Devolvido
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md font-bold text-[10px] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-pulse" /> Processando
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default WalletModal