import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Send, X, CheckCheck, CheckCircle2, Star, Loader2, Clock, Trash2, 
  DollarSign, CreditCard, QrCode, FileText, Copy, Check, Sparkles 
} from 'lucide-react'

// Função auxiliar para gerar Payload Pix EMV Estático Válido para testes
function calculateCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload({ key, name, city, amount, txid = 'DEMO123' }) {
  const cleanKey = key.replace(/\D/g, '');
  const formattedAmount = parseFloat(amount || 0).toFixed(2);
  
  const merchantAccountInfo = [
    '0014br.gov.bcb.pix',
    `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`
  ].join('');

  const parts = [
    '000201',
    `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`,
    '52040000',
    '5303986',
    `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`,
    '5802BR',
    `59${name.length.toString().padStart(2, '0')}${name}`,
    `60${city.length.toString().padStart(2, '0')}${city}`,
    `62${(4 + txid.length).toString().padStart(2, '0')}05${txid.length.toString().padStart(2, '0')}${txid}`,
    '6304'
  ];

  const rawPayload = parts.join('');
  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}

export function ChatModal({ request, currentUserType, senderName, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestStatus, setRequestStatus] = useState(request.status)

  // Estados de Pagamento
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [servicePrice, setServicePrice] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  
  // Modais de Checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Resumo, 2: Meio de Pagamento, 3: Pix
  const [selectedMethod, setSelectedMethod] = useState('PIX')
  const [copiedPix, setCopiedPix] = useState(false)
  const [simulatingPayment, setSimulatingPayment] = useState(false)

  // Estados de Avaliação
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const chatEndRef = useRef(null)

  // Gerar código Pix EMV válido com a sua chave
  const pixCode = generatePixPayload({
    key: '32984521595',
    name: 'MARKETPLACE',
    city: 'SAO PAULO',
    amount: paymentData?.amount || 10.00,
    txid: `REQ${request?.id || '123'}`
  })

  useEffect(() => {
    if (request?.status) {
      setRequestStatus(request.status)
    }
  }, [request?.status])

  useEffect(() => {
    if (!request?.id) return

    loadMessages()
    loadPayment()

    // Realtime para Mensagens
    const messageChannel = supabase
      .channel(`chat_messages_${request.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${request.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe()

    // Realtime para Pagamento
    const paymentChannel = supabase
      .channel(`chat_payment_${request.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments', filter: `request_id=eq.${request.id}` },
        (payload) => {
          const updatedPayment = payload.new
          setPaymentData(updatedPayment)

          if (updatedPayment.status === 'EM_CUSTODIA') {
            setShowCheckoutModal(false)
            setCheckoutStep(1)
            setRequestStatus('EM_ANDAMENTO')
            loadMessages()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(paymentChannel)
    }
  }, [request?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
    setLoading(false)
  }

  const loadPayment = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('request_id', request.id)
      .maybeSingle()

    if (data) {
      setPaymentData(data)
      setServicePrice(data.amount?.toString() || '')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || requestStatus === 'CONCLUIDO') return

    const msgText = newMessage
    setNewMessage('')

    await supabase.from('messages').insert([
      {
        request_id: request.id,
        sender_type: currentUserType,
        sender_name: senderName || (currentUserType === 'professional' ? 'Profissional' : 'Cliente'),
        content: msgText,
      },
    ])
  }

  // PROFISSIONAL: Define valor do serviço
  const handleSendPriceProposal = async (e) => {
    e.preventDefault()
    const val = parseFloat(servicePrice)
    if (isNaN(val) || val <= 0) return alert('Insira um valor válido.')

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('request_id', request.id)
      .maybeSingle()

    let error = null

    if (existingPayment) {
      const res = await supabase
        .from('payments')
        .update({ amount: val, status: 'PENDENTE_PAGAMENTO' })
        .eq('id', existingPayment.id)
      error = res.error
    } else {
      const res = await supabase.from('payments').insert([
        {
          request_id: request.id,
          professional_id: request.professional_id,
          client_id: request.client_id,
          amount: val,
          status: 'PENDENTE_PAGAMENTO',
        },
      ])
      error = res.error
    }

    if (!error) {
      await supabase.from('messages').insert([
        {
          request_id: request.id,
          sender_type: 'professional',
          sender_name: 'Sistema',
          content: `💳 O profissional definiu o valor do serviço em R$ ${val.toFixed(2)}. Utilize o card de pagamento para concluir.`,
        },
      ])
      setShowPriceModal(false)
      loadPayment()
      loadMessages()
    } else {
      alert(`Erro ao salvar cobrança: ${error.message}`)
    }
  }

  // SIMULAÇÃO DEMO: Botão para aprovar o pagamento manualmente
  const handleSimulateSuccessfulPayment = async () => {
    setSimulatingPayment(true)

    try {
      await supabase
        .from('payments')
        .update({ status: 'EM_CUSTODIA', payment_method: selectedMethod })
        .eq('request_id', request.id)

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('professional_id', request.professional_id)
        .maybeSingle()

      const currentPending = parseFloat(wallet?.pending_balance || 0)
      const amountToAdd = parseFloat(paymentData.amount)

      await supabase.from('wallets').upsert({
        professional_id: request.professional_id,
        pending_balance: currentPending + amountToAdd,
        updated_at: new Date().toISOString(),
      })

      await supabase
        .from('requests')
        .update({ status: 'EM_ANDAMENTO' })
        .eq('id', request.id)

      setRequestStatus('EM_ANDAMENTO')

      await supabase.from('messages').insert([
        {
          request_id: request.id,
          sender_type: 'client',
          sender_name: 'Sistema',
          content: `✅ Pagamento de R$ ${parseFloat(paymentData.amount).toFixed(2)} efetuado com sucesso via ${selectedMethod}! O valor está retido em custódia.`,
        },
      ])

      setShowCheckoutModal(false)
      setCheckoutStep(1)
      loadPayment()
      loadMessages()
    } catch (err) {
      alert(`Erro na simulação: ${err.message}`)
    } finally {
      setSimulatingPayment(false)
    }
  }

  // PROFISSIONAL: Solicita conclusão
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

  // CLIENTE: Confirma conclusão
  const handleConfirmCompletion = async () => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'CONCLUIDO' })
      .eq('id', request.id)

    if (!error) {
      if (paymentData && paymentData.status === 'EM_CUSTODIA') {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('professional_id', request.professional_id)
          .maybeSingle()

        const currentPending = parseFloat(wallet?.pending_balance || 0)
        const currentAvailable = parseFloat(wallet?.available_balance || 0)
        const amount = parseFloat(paymentData.amount)

        await supabase.from('wallets').upsert({
          professional_id: request.professional_id,
          pending_balance: Math.max(0, currentPending - amount),
          available_balance: currentAvailable + amount,
          updated_at: new Date().toISOString(),
        })

        await supabase.from('payments').update({ status: 'LIBERADO' }).eq('id', paymentData.id)
      }

      setRequestStatus('CONCLUIDO')
      setShowRatingModal(true)
    }
  }

  // PROFISSIONAL: Apaga chat e pedido
  const handleCloseAndDeleteChat = async () => {
    try {
      await supabase.from('messages').delete().eq('request_id', request.id)
      await supabase.from('requests').delete().eq('id', request.id)
    } catch (err) {
      console.error(err)
    } finally {
      onClose()
    }
  }

  // CLIENTE: Submete avaliação
  const handleSubmitRating = async (e) => {
    e.preventDefault()
    setSubmittingRating(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('reviews').insert([
        {
          professional_id: request.professional_id,
          client_id: userData?.user?.id || request.client_id,
          request_id: request.id,
          client_name: senderName || 'Cliente',
          rating: parseInt(rating),
          comment: comment,
        },
      ])
      await supabase.from('messages').delete().eq('request_id', request.id)
      setShowRatingModal(false)
      onClose()
    } catch (err) {
      alert(`Erro ao guardar avaliação: ${err.message}`)
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 3000)
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`

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
                {/* O botão 'Cobrar Serviço' só é exibido se ainda NÃO existir cobrança gerada (!paymentData) */}
                {requestStatus !== 'CONCLUIDO' && !paymentData && (
                  <button
                    onClick={() => setShowPriceModal(true)}
                    className="bg-[#00a884] hover:bg-[#008f70] text-black font-black text-xs px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Cobrar Serviço
                  </button>
                )}

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
                    Aguardando confirmação
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

        {/* Cliente: Alerta de Confirmação */}
        {currentUserType === 'client' && requestStatus === 'AGUARDANDO_CONCLUSAO' && (
          <div className="bg-[#eab308]/10 border-b border-[#eab308]/30 p-3 text-center space-y-2">
            <p className="text-xs text-[#eab308] font-bold">
              O profissional solicitou a finalização deste serviço. Confirma que o trabalho foi concluído? O pagamento será libertado ao profissional.
            </p>
            <button
              onClick={handleConfirmCompletion}
              className="bg-[#00a884] hover:bg-[#008f70] text-black font-black text-xs px-4 py-2 rounded uppercase cursor-pointer"
            >
              Confirmar Conclusão e Avaliar
            </button>
          </div>
        )}

        {/* Profissional: Banner de Conclusão */}
        {currentUserType === 'professional' && requestStatus === 'CONCLUIDO' && (
          <div className="bg-blue-500/10 border-b border-blue-500/30 p-3 text-center space-y-2">
            <p className="text-xs text-blue-400 font-bold">
              Serviço concluído! Clique no botão para fechar e eliminar o histórico.
            </p>
            <button
              onClick={handleCloseAndDeleteChat}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded uppercase cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Trash2 className="w-4 h-4" />
              Fechar Chat e Eliminar Pedido
            </button>
          </div>
        )}

        {/* Barra do Serviço */}
        <div className="bg-[#111b21] px-4 py-2 border-b border-neutral-800 text-xs text-neutral-400 flex justify-between items-center">
          <div><strong className="text-neutral-300">Serviço:</strong> {request.description}</div>
          {paymentData && (
            <div className="text-[11px] font-bold text-[#00a884]">
              Valor: R$ {parseFloat(paymentData.amount).toFixed(2)} ({paymentData.status})
            </div>
          )}
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a]">
          
          {/* Card de Cobrança no Chat para o Cliente */}
          {currentUserType === 'client' && paymentData && paymentData.status === 'PENDENTE_PAGAMENTO' && (
            <div className="bg-[#18181b] border border-neutral-700 rounded-2xl p-5 max-w-sm mx-auto shadow-xl space-y-4 text-white">
              <h4 className="text-base font-bold border-b border-neutral-800 pb-2">Resumo da compra</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Produto / Serviço</span>
                  <span>R$ {parseFloat(paymentData.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Garantia de Custódia</span>
                  <span>Grátis</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg font-black text-white">R$ {parseFloat(paymentData.amount).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckoutStep(1)
                  setShowCheckoutModal(true)
                }}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-xl transition cursor-pointer shadow-lg"
              >
                Pagar e finalizar
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center text-xs text-neutral-500 py-8">Carregando conversa...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-neutral-500 py-8">Nenhuma mensagem encontrada.</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_type === currentUserType
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3.5 py-2 text-xs relative ${isMe ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-neutral-200 rounded-tl-none'}`}>
                    {!isMe && <span className="block text-[10px] font-bold text-[#eab308] mb-0.5">{msg.sender_name}</span>}
                    <p className="leading-relaxed break-words">{msg.content || msg.text}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-400 mt-1">
                      <span>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input da Mensagem */}
        <form onSubmit={handleSendMessage} className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-neutral-800">
          <input 
            type="text"
            disabled={requestStatus === 'CONCLUIDO'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={requestStatus === 'CONCLUIDO' ? 'Serviço concluído' : 'Digite uma mensagem...'}
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

        {/* MODAL CHECKOUT EM ETAPAS */}
        {showCheckoutModal && paymentData && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-[#18181b] border border-neutral-800 rounded-2xl max-w-md w-full p-6 text-white space-y-5 relative">
              <button 
                onClick={() => setShowCheckoutModal(false)} 
                className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ETAPA 1 */}
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Resumo da compra</h3>
                  <div className="space-y-2 text-xs border-b border-neutral-800 pb-4">
                    <div className="flex justify-between text-neutral-300">
                      <span>Produto / Serviço</span>
                      <span>R$ {parseFloat(paymentData.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Garantia de Custódia</span>
                      <span>Grátis</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-xl font-black text-white">R$ {parseFloat(paymentData.amount).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-xl transition cursor-pointer"
                  >
                    Pagar e finalizar
                  </button>
                </div>
              )}

              {/* ETAPA 2 */}
              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Meios de pagamento</h3>
                  <div className="space-y-3">
                    <label 
                      onClick={() => setSelectedMethod('PIX')}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedMethod === 'PIX' ? 'border-[#2563eb] bg-[#2563eb]/10' : 'border-neutral-800 bg-neutral-900'}`}
                    >
                      <input type="radio" name="paymentMethod" checked={selectedMethod === 'PIX'} onChange={() => {}} className="accent-[#2563eb]" />
                      <QrCode className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold">Pix</span>
                    </label>

                    <label 
                      onClick={() => setSelectedMethod('CARTAO')}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedMethod === 'CARTAO' ? 'border-[#2563eb] bg-[#2563eb]/10' : 'border-neutral-800 bg-neutral-900'}`}
                    >
                      <input type="radio" name="paymentMethod" checked={selectedMethod === 'CARTAO'} onChange={() => {}} className="accent-[#2563eb]" />
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold">Cartão de Crédito</span>
                    </label>

                    <label 
                      onClick={() => setSelectedMethod('BOLETO')}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedMethod === 'BOLETO' ? 'border-[#2563eb] bg-[#2563eb]/10' : 'border-neutral-800 bg-neutral-900'}`}
                    >
                      <input type="radio" name="paymentMethod" checked={selectedMethod === 'BOLETO'} onChange={() => {}} className="accent-[#2563eb]" />
                      <FileText className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs font-bold">Boleto</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setCheckoutStep(1)} className="flex-1 bg-neutral-800 text-xs py-3 rounded-xl font-bold cursor-pointer">Voltar</button>
                    <button onClick={() => setCheckoutStep(3)} className="flex-1 bg-[#2563eb] text-xs py-3 rounded-xl font-bold cursor-pointer">Continuar</button>
                  </div>
                </div>
              )}

              {/* ETAPA 3 */}
              {checkoutStep === 3 && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold">Pague R$ {parseFloat(paymentData.amount).toFixed(2)} via Pix</h3>

                  {/* QR Code Válido */}
                  <div className="bg-white p-3 rounded-xl max-w-[200px] mx-auto shadow-md">
                    <img src={qrCodeUrl} alt="QR Code PIX" className="w-full h-auto block rounded" />
                  </div>

                  {/* Código Pix Copia e Cola */}
                  <div className="space-y-2 text-left">
                    <p className="text-xs font-bold text-neutral-300">Código Pix Copia e Cola:</p>
                    <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-[10px] font-mono break-all text-neutral-400 max-h-16 overflow-y-auto">
                      {pixCode}
                    </div>
                    <button
                      onClick={handleCopyPix}
                      className="w-full bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedPix ? 'Código copiado!' : 'Copiar código'}
                    </button>
                  </div>

                  {/* BOTÃO DE SIMULAÇÃO DE TESTE */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <p className="text-[11px] text-amber-400 flex items-center justify-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" /> Modo Demonstrativo de Testes:
                    </p>
                    <button
                      onClick={handleSimulateSuccessfulPayment}
                      disabled={simulatingPayment}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                    >
                      {simulatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : '🧪 Simular Pagamento Confirmado'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal: Profissional Define Valor */}
        {showPriceModal && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
              <h3 className="text-base font-bold text-white">Solicitar Pagamento</h3>
              <form onSubmit={handleSendPriceProposal} className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Valor do Serviço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="Ex: 150.00"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm text-white focus:outline-none focus:border-[#00a884]"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowPriceModal(false)} className="flex-1 bg-neutral-800 text-white text-xs py-2.5 rounded font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 bg-[#00a884] text-black text-xs py-2.5 rounded font-bold">Enviar Cobrança</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Avaliação */}
        {showRatingModal && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-2xl max-w-md w-full space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#00a884] mx-auto" />
              <h3 className="text-lg font-black uppercase text-white">Serviço Concluído!</h3>
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="cursor-pointer">
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-[#eab308] text-[#eab308]' : 'text-neutral-700'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Conte como foi sua experiência..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="w-full bg-[#eab308] text-black font-black uppercase text-xs py-3 rounded cursor-pointer flex items-center justify-center gap-2"
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