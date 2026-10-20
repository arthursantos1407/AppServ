import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Check, Crown, Zap, Shield, Sparkles, X, Loader2, Gift } from 'lucide-react'

const PLANS = [
  {
    id: 'FREE',
    name: 'Teste Grátis',
    price: 0,
    period: '/1º mês',
    description: 'Experimente a plataforma gratuitamente no seu primeiro mês.',
    features: [
      'Propostas ilimitadas por 30 dias',
      '0% de comissão sobre serviços',
      'Acesso total ao chat com clientes',
      'Válido uma única vez por profissional',
    ],
    popular: false,
    isFree: true,
  },
  {
    id: 'MENSAL',
    name: 'Plano Mensal',
    price: 99.90,
    period: '/mês',
    description: 'Ideal para quem está a começar na plataforma.',
    features: [
      'Propostas ilimitadas',
      '100% do valor do serviço é seu (0% comissão)',
      'Selo de Profissional Verificado',
      'Suporte prioritário via WhatsApp',
    ],
    popular: false,
  },
  {
    id: 'TRIMESTRAL',
    name: 'Plano Trimestral',
    price: 260.90,
    period: '/3 meses',
    savings: 'Economize 13%',
    description: 'O melhor equilíbrio entre flexibilidade e desconto.',
    features: [
      'Tudo do Plano Mensal',
      'Desconto de 13% em relação ao mensal',
      'Destaque nas pesquisas de clientes',
      'Acesso antecipado a novos pedidos',
    ],
    popular: true,
  },
  {
    id: 'ANUAL',
    name: 'Plano Anual',
    price: 799.90,
    period: '/ano',
    savings: 'Economize 33%',
    description: 'Máxima economia para profissionais consolidados.',
    features: [
      'Tudo do Plano Trimestral',
      'Desconto de 33% em relação ao mensal',
      'Selo VIP no perfil',
      'Posicionamento prioritário no topo',
    ],
    popular: false,
  },
]

export function PlansModal({ onClose, onSelectPlan }) {
  const [currentSub, setCurrentSub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveSubscription()
  }, [])

  const loadActiveSubscription = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('professional_id', userData.user.id)
        .eq('status', 'ATIVO')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (data) setCurrentSub(data)
    } catch (err) {
      console.error('Erro ao carregar subscrição:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Corrigido: overflow-y-auto no container principal + alinhamento seguro para mobile */
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex justify-center items-start sm:items-center">
      <div className="bg-[#0b141a] border border-neutral-800 rounded-2xl w-full max-w-6xl p-5 sm:p-6 relative text-white space-y-6 shadow-2xl my-auto mt-10 sm:mt-auto">
        
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center space-y-2 max-w-lg mx-auto pt-2 sm:pt-0">
          <div className="inline-flex items-center gap-2 bg-[#00a884]/10 text-[#00a884] px-3 py-1 rounded-full text-xs font-bold border border-[#00a884]/20">
            <Crown className="w-4 h-4" />
            Planos & Assinaturas
          </div>
          <h2 className="text-2xl font-black text-white">Escolha o plano ideal para si</h2>
          <p className="text-xs text-neutral-400">
            Receba 100% do valor dos seus atendimentos diretamente na sua conta. Sem taxas por serviço realizado.
          </p>
        </div>

        {/* Indicador de Subscrição Ativa */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-[#00a884] animate-spin" />
          </div>
        ) : currentSub ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Subscrição Ativa: {currentSub.plan_name}</p>
                <p className="text-neutral-400 text-[11px]">
                  Válida até {new Date(currentSub.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <span className="bg-emerald-500 text-black font-black px-2.5 py-1 rounded text-[10px] uppercase">
              Ativo
            </span>
          </div>
        ) : null}

        {/* Grid dos Planos (1 coluna no mobile, 2 em tablets e 4 em PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 pt-2">
          {PLANS.map((plan) => {
            const isCurrent = currentSub?.plan_name === plan.id

            return (
              <div
                key={plan.id}
                className={`relative bg-[#18181b] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'border-[#00a884] shadow-lg shadow-[#00a884]/10'
                    : plan.isFree
                    ? 'border-amber-500/50 hover:border-amber-500'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Badges */}
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00a884] text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> Mais Escolhido
                  </span>
                )}
                {plan.isFree && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Gift className="w-3 h-3" /> Grátis por 30 dias
                  </span>
                )}

                <div className="space-y-4 pt-1">
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{plan.description}</p>
                  </div>

                  {/* Preço */}
                  <div className="border-b border-neutral-800 pb-4">
                    <div className="flex items-baseline gap-1">
                      {plan.price > 0 ? (
                        <>
                          <span className="text-xs text-neutral-400">R$</span>
                          <span className="text-2xl font-black text-white">{plan.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-amber-400 uppercase">Grátis</span>
                      )}
                      <span className="text-xs text-neutral-400">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  {/* Vantagens */}
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-neutral-300">
                        <Check className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botão de Ação */}
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => onSelectPlan && onSelectPlan(plan)}
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : plan.isFree
                      ? 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                      : plan.popular
                      ? 'bg-[#00a884] hover:bg-[#008f70] text-black font-black'
                      : 'bg-white hover:bg-neutral-200 text-black'
                  }`}
                >
                  {isCurrent ? 'Plano Atual' : plan.isFree ? 'Resgatar Mês Grátis' : 'Assinar Agora'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Garantia */}
        <div className="flex items-center justify-center gap-2 text-neutral-500 text-[11px] pt-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Pagamento seguro via Mercado Pago. Cancele quando quiser.</span>
        </div>

      </div>
    </div>
  )
}