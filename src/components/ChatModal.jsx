import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Send, X, CheckCheck, CheckCircle2, Star, Loader2, Clock, Trash2 } from 'lucide-react'

export function ChatModal({ request, currentUserType, senderName, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestStatus, setRequestStatus] = useState(request.status)

  // Estados do Modal de Avaliação
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (request?.status) {
      setRequestStatus(request.status)
    }
  }, [request?.status])

  useEffect(() => {
    if (!request?.id) return

    loadMessages()

    const channel = supabase
      .channel(`chat_request_${request.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${request.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [request?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
    setLoading(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || requestStatus === 'CONCLUIDO') return

    const msgText = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert([
      {
        request_id: request.id,
        sender_type: currentUserType,
        sender_name: senderName || (currentUserType === 'professional' ? 'Profissional' : 'Cliente'),
        content: msgText,
      },
    ])

    if (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem.')
    }
  }

  // O Profissional solicita a conclusão
  const handleRequestCompletion = async () => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'AGUARDANDO_CONCLUSAO' })
      .eq('id', request.id)

    if (!error) {
      setRequestStatus('AGUARDANDO_CONCLUSAO')
      await supabase.from('messages').insert([
        {
          request_id: request.id,
          sender_type: 'professional',
          sender_name: 'Sistema',
          content: '🔔 O profissional solicitou a confirmação de conclusão do serviço.',
        },
      ])
      loadMessages()
    }
  }

  // Cliente confirma a conclusão
  const handleConfirmCompletion = async () => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'CONCLUIDO' })
      .eq('id', request.id)

    if (!error) {
      setRequestStatus('CONCLUIDO')
      setShowRatingModal(true)
    }
  }

  // Apaga as mensagens e o registro em 'requests'
  const handleCloseAndDeleteChat = async () => {
    try {
      // 1. Apaga todas as mensagens vinculadas a essa solicitação
      const { error: msgErr } = await supabase
        .from('messages')
        .delete()
        .eq('request_id', request.id)

      if (msgErr) console.error('Erro ao excluir mensagens:', msgErr.message)

      // 2. Apaga a própria solicitação em 'requests'
      const { error: reqErr } = await supabase
        .from('requests')
        .delete()
        .eq('id', request.id)

      if (reqErr) {
        console.error('Erro ao excluir solicitação:', reqErr.message)
        alert(`Erro ao excluir solicitação: ${reqErr.message}`)
      }
    } catch (err) {
      console.error('Erro geral na exclusão:', err)
    } finally {
      onClose()
    }
  }

  // SUBMETER AVALIAÇÃO + EXCLUIR CHAT (Cliente)
  const handleSubmitRating = async (e) => {
    e.preventDefault()
    setSubmittingRating(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id

      const { error: reviewError } = await supabase.from('reviews').insert([
        {
          professional_id: request.professional_id,
          client_id: currentUserId || request.client_id,
          request_id: request.id,
          client_name: senderName || 'Cliente',
          rating: parseInt(rating),
          comment: comment,
        },
      ])

      if (reviewError) throw reviewError

      // Apaga as mensagens
      await supabase.from('messages').delete().eq('request_id', request.id)

      alert('Serviço concluído e avaliação enviada com sucesso!')
      setShowRatingModal(false)
      onClose()
    } catch (err) {
      console.error('Erro detalhado do Supabase:', err)
      alert(`Erro ao guardar avaliação: ${err.message || JSON.stringify(err)}`)
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0b141a] border border-neutral-800 rounded-xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Cabeçalho */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-black font-black flex items-center justify-center text-sm uppercase">
              {currentUserType === 'professional' ? 'C' : 'P'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUserType === 'professional' ? 'Conversa com Cliente' : 'Conversa com Profissional'}
              </h3>
              <p className="text-[10px] text-[#eab308] font-bold uppercase">
                Status: {requestStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUserType === 'professional' && (
              <>
                {requestStatus !== 'CONCLUIDO' && requestStatus !== 'AGUARDANDO_CONCLUSAO' && (
                  <button
                    onClick={handleRequestCompletion}
                    className="bg-[#eab308] hover:bg-yellow-500 text-black font-black text-xs px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    Solicitar Conclusão
                  </button>
                )}

                {requestStatus === 'AGUARDANDO_CONCLUSAO' && (
                  <span className="bg-yellow-500/10 border border-[#eab308]/30 text-[#eab308] font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" />
                    Aguardando confirmação do cliente
                  </span>
                )}

                {requestStatus === 'CONCLUIDO' && (
                  <button
                    onClick={handleCloseAndDeleteChat}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Fechar e Apagar Chat
                  </button>
                )}
              </>
            )}

            <button 
              onClick={requestStatus === 'CONCLUIDO' && currentUserType === 'professional' ? handleCloseAndDeleteChat : onClose}
              className="text-neutral-400 hover:text-white transition p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cliente: Alerta de Confirmação exclusivo */}
        {currentUserType === 'client' && requestStatus === 'AGUARDANDO_CONCLUSAO' && (
          <div className="bg-[#eab308]/10 border-b border-[#eab308]/30 p-3 text-center space-y-2">
            <p className="text-xs text-[#eab308] font-bold">
              O profissional solicitou a finalização deste serviço. Confirma que o trabalho foi concluído?
            </p>
            <button
              onClick={handleConfirmCompletion}
              className="bg-[#00a884] hover:bg-[#008f70] text-black font-black text-xs px-4 py-2 rounded uppercase cursor-pointer"
            >
              Confirmar Conclusão e Avaliar
            </button>
          </div>
        )}

        {/* Profissional: Banner de Serviço Concluído com opção de Excluir Chat */}
        {currentUserType === 'professional' && requestStatus === 'CONCLUIDO' && (
          <div className="bg-blue-500/10 border-b border-blue-500/30 p-3 text-center space-y-2">
            <p className="text-xs text-blue-400 font-bold">
              Este serviço foi concluído! Clique no botão abaixo para fechar e apagar permanentemente este serviço e o histórico de conversas.
            </p>
            <button
              onClick={handleCloseAndDeleteChat}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded uppercase cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Trash2 className="w-4 h-4" />
              Fechar Chat e Excluir Solicitação
            </button>
          </div>
        )}

        <div className="bg-[#111b21] px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400">
          <strong className="text-neutral-300">Serviço:</strong> {request.description}
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
          {loading ? (
            <div className="text-center text-xs text-neutral-500 py-8">Carregando conversa...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-neutral-500 py-8">
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_type === currentUserType

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-3.5 py-2 text-xs relative ${
                      isMe 
                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                        : 'bg-[#202c33] text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {!isMe && (
                      <span className="block text-[10px] font-bold text-[#eab308] mb-0.5">
                        {msg.sender_name}
                      </span>
                    )}

                    <p className="leading-relaxed break-words">{msg.content || msg.text}</p>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-400 mt-1">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Envio de Mensagem */}
        <form onSubmit={handleSendMessage} className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-neutral-800">
          <input 
            type="text"
            disabled={requestStatus === 'CONCLUIDO'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={requestStatus === 'CONCLUIDO' ? 'Serviço concluído (chat encerrado)' : 'Digite uma mensagem...'}
            className="flex-1 bg-[#2a3942] text-white placeholder-neutral-400 text-xs rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#00a884] disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || requestStatus === 'CONCLUIDO'}
            className="bg-[#00a884] hover:bg-[#008f70] text-black font-bold p-3 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Modal de Avaliação do Cliente */}
        {showRatingModal && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-2xl max-w-md w-full space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#00a884] mx-auto" />
              <h3 className="text-lg font-black uppercase text-white">Serviço Concluído!</h3>
              <p className="text-xs text-neutral-400">Avalie o trabalho do profissional para finalizar o pedido.</p>

              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? 'fill-[#eab308] text-[#eab308]' : 'text-neutral-700'}`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Conte como foi sua experiência com este serviço..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs py-3 rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Avaliação e Concluir'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ChatModal