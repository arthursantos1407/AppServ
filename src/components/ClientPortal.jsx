import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChatModal } from './ChatModal'
import { 
  Inbox, LogOut, Clock, ArrowLeft, MessageSquare, CheckCircle, AlertCircle 
} from 'lucide-react'

export function ClientPortal({ user, onLogout, onGoToPublicSite }) {
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChatRequest, setSelectedChatRequest] = useState(null)

  useEffect(() => {
    if (user) {
      loadClientData()
    }
  }, [user])

  const loadClientData = async () => {
    setLoading(true)

    // 1. Carrega o perfil do cliente
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profData) setProfile(profData)

    // 2. Carrega as solicitações enviadas por este cliente juntamente com os dados do profissional
    const { data: reqData, error } = await supabase
      .from('requests')
      .select(`
        *,
        professional:profiles!requests_professional_id_fkey (
          full_name,
          category
        )
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && reqData) {
      setRequests(reqData)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      
      {/* Cabeçalho */}
      <header className="bg-[#18181b] border-b border-neutral-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#00a884] text-black font-black text-lg px-2.5 py-0.5 rounded-sm">
              C+
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-wider uppercase">ÁREA DO CLIENTE</h1>
              <p className="text-xs text-neutral-400">Acompanhe seus pedidos de orçamento e conversas</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={onGoToPublicSite}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Buscar Profissionais
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo do Painel */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">Carregando suas solicitações...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Meus Pedidos de Orçamento</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Quando o profissional aceitar seu orçamento, o botão do WhatsApp aparecerá para vocês conversarem.
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="bg-[#18181b] border border-neutral-800 p-12 text-center rounded-lg space-y-3">
                <Inbox className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 font-medium text-sm">Você ainda não solicitou nenhum orçamento.</p>
                <button 
                  onClick={onGoToPublicSite}
                  className="bg-[#eab308] text-black text-xs font-black uppercase px-4 py-2.5 rounded transition cursor-pointer"
                >
                  Procurar um Profissional
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => {
                  const isAccepted = req.status === 'ACEITO'
                  const profName = req.professional?.full_name || 'Profissional'
                  const profCategory = req.professional?.category || 'Serviço Geral'

                  return (
                    <div key={req.id} className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Status e Data */}
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded flex items-center gap-1 ${
                            isAccepted 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                              : 'bg-yellow-500/10 text-[#eab308] border border-yellow-500/20'
                          }`}>
                            {isAccepted ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {req.status || 'PENDENTE'}
                          </span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Dados do Profissional */}
                        <div>
                          <p className="text-xs text-neutral-400 uppercase font-bold">Profissional Contatado</p>
                          <h4 className="text-base font-bold text-white">{profName}</h4>
                          <p className="text-xs text-[#eab308] font-semibold">{profCategory}</p>
                        </div>

                        {/* Detalhes do Pedido */}
                        <div className="bg-neutral-900 p-3 rounded border border-neutral-800 space-y-1">
                          <p className="text-xs text-neutral-300 font-medium leading-relaxed">{req.description}</p>
                          <p className="text-[11px] text-neutral-500 mt-2">
                            Prazo: <span className="text-neutral-300 font-bold">{req.when_needed}</span>
                          </p>
                        </div>
                      </div>

                      {/* Botão de Chat ou Aguardando */}
                      <div className="pt-2">
                        {isAccepted ? (
                          <button 
                            key={`chat-client-btn-${req.id}`}
                            onClick={() => setSelectedChatRequest(req)}
                            className="w-full bg-[#00a884] hover:bg-[#008f70] text-black font-black uppercase text-xs py-3 rounded flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Abrir Chat com {profName}</span>
                          </button>
                        ) : (
                          <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs font-bold uppercase py-3 rounded text-center">
                            Aguardando Profissional Aceitar
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal do Chat em estilo WhatsApp */}
      {selectedChatRequest && (
        <ChatModal 
          request={selectedChatRequest}
          currentUserType="client"
          senderName={profile?.full_name || 'Cliente'}
          onClose={() => setSelectedChatRequest(null)}
        />
      )}

    </div>
  )
}

export default ClientPortal;