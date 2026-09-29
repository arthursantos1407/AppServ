import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Send, X, CheckCheck } from 'lucide-react'

export function ChatModal({ request, currentUserType, senderName, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!request?.id) return

    // 1. Carrega mensagens existentes
    loadMessages()

    // 2. Escuta novas mensagens em tempo real (Supabase Realtime)
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
    // Rola para a mensagem mais recente
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
    if (!newMessage.trim()) return

    const msgText = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert([
      {
        request_id: request.id,
        sender_type: currentUserType, // 'professional' ou 'client'
        sender_name: senderName || (currentUserType === 'professional' ? 'Profissional' : 'Cliente'),
        content: msgText,
      },
    ])

    if (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0b141a] border border-neutral-800 rounded-xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Cabeçalho do Chat estilo WhatsApp */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-black font-black flex items-center justify-center text-sm uppercase">
              {currentUserType === 'professional' ? 'C' : 'P'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUserType === 'professional' ? 'Conversa com Cliente' : 'Conversa com Profissional'}
              </h3>
              <p className="text-[10px] text-[#00a884] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse"></span>
                Em negociação
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition p-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detalhes do Serviço Solicitado */}
        <div className="bg-[#111b21] px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400">
          <strong className="text-neutral-300">Serviço:</strong> {request.description}
        </div>

        {/* Corpo de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
          {loading ? (
            <div className="text-center text-xs text-neutral-500 py-8">Carregando conversa...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-neutral-500 py-8">
              Nenhuma mensagem ainda. Inicie a conversa abaixo!
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

                    <p className="leading-relaxed break-words">{msg.content}</p>

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

        {/* Campo de Envio de Mensagem */}
        <form onSubmit={handleSendMessage} className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-neutral-800">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-[#2a3942] text-white placeholder-neutral-400 text-xs rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#00a884] hover:bg-[#008f70] text-black font-bold p-3 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  )
}
export default ChatModal;