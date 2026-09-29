import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Star, MapPin, Tag, ArrowLeft, Image as ImageIcon, 
  MessageSquare, Send, CheckCircle2, Loader2, Calendar 
} from 'lucide-react'

export function ProfileDetailView({ professional, profile, onBack }) {
  // Unifica a propriedade para evitar erros caso venha como 'professional' ou 'profile'
  const profData = professional || profile || {}

  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Estados do formulário de solicitação de orçamento
  const [requestDesc, setRequestDesc] = useState('')
  const [whenNeeded, setWhenNeeded] = useState('Urgente')
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Estados do formulário de nova avaliação
  const [clientName, setClientName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (profData?.id) {
      loadReviews()
    }
  }, [profData?.id])

  const loadReviews = async () => {
    setLoadingReviews(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', profData.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data)
    }
    setLoadingReviews(false)
  }

  // Enviar Solicitação de Orçamento
  const handleSendRequest = async (e) => {
    e.preventDefault()
    setSendingRequest(true)

    try {
      const { error } = await supabase.from('requests').insert([
        {
          professional_id: profData.id,
          description: requestDesc,
          when_needed: whenNeeded,
          status: 'PENDENTE',
        },
      ])

      if (error) throw error

      setRequestSuccess(true)
      setRequestDesc('')
    } catch (err) {
      alert('Erro ao enviar solicitação. Tente novamente!')
      console.error(err)
    } finally {
      setSendingRequest(false)
    }
  }

  // Enviar Nova Avaliação
  const handleSendReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          professional_id: profData.id,
          client_name: clientName,
          rating: parseInt(rating),
          comment,
        },
      ])

      if (error) throw error

      alert('Avaliação enviada com sucesso!')
      setClientName('')
      setComment('')
      setRating(5)
      loadReviews()
    } catch (err) {
      alert('Erro ao enviar avaliação.')
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  // Média de Avaliações
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'Novo'

  const gallery = profData.gallery || []

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Botão Voltar */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition text-xs font-bold uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a busca
        </button>

        {/* Cabeçalho do Perfil */}
        <div className="bg-[#18181b] border border-neutral-800 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img 
            src={profData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'} 
            alt={profData.full_name} 
            className="w-28 h-28 rounded-xl object-cover border-2 border-[#eab308] shrink-0"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h1 className="text-2xl font-black uppercase tracking-tight">{profData.full_name}</h1>
              
              <div className="flex items-center justify-center md:justify-end gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg w-fit mx-auto md:mx-0">
                <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                <span className="text-xs font-black text-white">{averageRating}</span>
                <span className="text-[10px] text-neutral-500">({reviews.length} avaliações)</span>
              </div>
            </div>

            <p className="text-sm font-bold text-[#eab308] uppercase">{profData.category}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {profData.city || profData.location}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-neutral-500" /> A partir de: <strong className="text-white">R$ {profData.price_starting_at}</strong>
              </span>
            </div>

            {profData.bio && (
              <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800/60 mt-3">
                {profData.bio}
              </p>
            )}
          </div>
        </div>

        {/* GALERIA DE TRABALHOS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#eab308]" />
            <h2 className="text-lg font-black uppercase tracking-tight">Galeria de Trabalhos</h2>
          </div>

          {gallery.length === 0 ? (
            <div className="bg-[#18181b] border border-neutral-800 p-8 rounded-xl text-center text-xs text-neutral-500">
              O profissional ainda não adicionou fotos na galeria.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((imgUrl, idx) => (
                <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden h-40 group">
                  <img 
                    src={imgUrl} 
                    alt={`Trabalho ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SEÇÃO: SOLICITAÇÃO DE ORÇAMENTO */}
        <section className="bg-[#18181b] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-[#eab308]" /> Solicitar Orçamento Grátis
          </h2>

          {requestSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Sua solicitação foi enviada ao profissional! Em breve ele entrará em contato.
            </div>
          ) : (
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                  Descreva o serviço que você precisa
                </label>
                <textarea 
                  rows={3} 
                  required
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  placeholder="Ex: Preciso de orçamento para instalação de 3 tomadas e verificação do quadro de força."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Quando precisa do serviço?</label>
                  <select 
                    value={whenNeeded}
                    onChange={(e) => setWhenNeeded(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                  >
                    <option value="Urgente">Urgente (Hoje ou amanhã)</option>
                    <option value="Esta semana">Esta semana</option>
                    <option value="Nos próximos 15 dias">Nos próximos 15 dias</option>
                    <option value="Apenas pesquisando preço">Apenas pesquisando preço</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    type="submit" 
                    disabled={sendingRequest}
                    className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs py-3 rounded transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {sendingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Solicitação'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* SEÇÃO DE AVALIAÇÕES */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#eab308]" /> Avaliações de Clientes
            </h2>
          </div>

          {/* Form para Deixar Avaliação */}
          <form onSubmit={handleSendReview} className="bg-[#18181b] border border-neutral-800 p-6 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase text-neutral-300">Deixe sua avaliação</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Nota (Estrelas)</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Muito Bom)</option>
                  <option value={3}>⭐⭐⭐ (3 - Bom)</option>
                  <option value={2}>⭐⭐ (2 - Regular)</option>
                  <option value={1}>⭐ (1 - Ruim)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Comentário</label>
              <textarea 
                rows={2} 
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como foi sua experiência com este profissional..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
              />
            </div>

            <button 
              type="submit" 
              disabled={submittingReview}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 px-5 rounded border border-neutral-700 transition flex items-center gap-2 cursor-pointer"
            >
              {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar Avaliação'}
            </button>
          </form>

          {/* Lista de Avaliações */}
          {loadingReviews ? (
            <div className="text-center text-xs text-neutral-500 py-4">Carregando avaliações...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#18181b] border border-neutral-800 p-8 rounded-xl text-center text-xs text-neutral-500">
              Nenhuma avaliação cadastrada até o momento. Seja o primeiro a avaliar!
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-[#18181b] border border-neutral-800 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{rev.client_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-[#eab308] fill-[#eab308]' : 'text-neutral-700'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 pt-1">
                    <Calendar className="w-3 h-3" /> {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default ProfileDetailView;