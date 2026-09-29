import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { updateProfile } from '../services/profiles'
import { ChatModal } from './ChatModal'
import { 
  Inbox, Image as ImageIcon, Settings, LogOut, 
  Trash2, Save, Clock, Loader2, ArrowLeft, Upload,
  CheckCircle, MessageSquare, User, Camera 
} from 'lucide-react'

export function ProfessionalPortal({ user, onLogout, onGoToPublicSite }) {
  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'gallery' | 'settings'
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Estado para controlar o chat aberto
  const [selectedChatRequest, setSelectedChatRequest] = useState(null)

  // Estados do formulário de configurações
  const [avatarUrl, setAvatarUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [priceStartingAt, setPriceStartingAt] = useState('')
  const [bio, setBio] = useState('')
  const [gallery, setGallery] = useState([])

  const galleryFileInputRef = useRef(null)
  const avatarFileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      loadProfileAndRequests()
    }
  }, [user])

  const loadProfileAndRequests = async () => {
    setLoading(true)

    // 1. Busca dados do perfil do profissional logado
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profData) {
      setProfile(profData)
      setAvatarUrl(profData.avatar_url || '')
      setFullName(profData.full_name || '')
      setCategory(profData.category || '')
      setCity(profData.city || profData.location || '')
      setPriceStartingAt(profData.price_starting_at || '')
      setBio(profData.bio || '')
      setGallery(profData.gallery || [])
    }

    // 2. Busca solicitações de clientes
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })

    if (reqData) {
      setRequests(reqData)
    }

    setLoading(false)
  }

  // Aceitar solicitação de serviço
  const handleAcceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'ACEITO' })
        .eq('id', requestId)

      if (error) throw error

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'ACEITO' } : r))
      )
    } catch (err) {
      alert('Erro ao aceitar solicitação.')
      console.error(err)
    }
  }

  // Upload da Foto de Perfil (Avatar)
  const handleAvatarUpload = async (event) => {
    try {
      setUploadingAvatar(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Envia para o bucket 'avatars' (ou 'gallery' caso prefira usar o mesmo)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl
      setAvatarUrl(publicUrl)

      // Atualiza automaticamente no banco de dados
      await updateProfile(user.id, { avatar_url: publicUrl })
    } catch (error) {
      alert('Erro ao enviar foto de perfil. Verifique se o bucket "avatars" existe no Supabase Storage.')
      console.error(error)
    } finally {
      setUploadingAvatar(false)
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = ''
      }
    }
  }

  // Upload de foto para a galeria de trabalhos
  const handleGalleryUpload = async (event) => {
    try {
      setUploadingGallery(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
      const fileName = `${Math.random()}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl
      const updatedGallery = [...gallery, publicUrl]
      setGallery(updatedGallery)

      await updateProfile(user.id, { gallery: updatedGallery })
    } catch (error) {
      alert('Erro ao enviar imagem. Verifique se o bucket "gallery" foi criado no Supabase.')
      console.error(error)
    } finally {
      setUploadingGallery(false)
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }
    }
  }

  // Remover foto da galeria
  const handleRemoveImage = async (indexToRemove) => {
    const updatedGallery = gallery.filter((_, idx) => idx !== indexToRemove)
    setGallery(updatedGallery)
    await updateProfile(user.id, { gallery: updatedGallery })
  }

  // Salvar alterações do perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfile(user.id, {
        avatar_url: avatarUrl,
        full_name: fullName,
        category: category,
        city: city,
        location: city,
        price_starting_at: parseFloat(priceStartingAt) || 0,
        bio: bio,
        gallery: gallery,
      })
      alert('Configurações salvas com sucesso!')
    } catch (err) {
      alert('Erro ao salvar alterações.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      
      {/* Cabeçalho do Painel */}
      <header className="bg-[#18181b] border-b border-neutral-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            {/* Foto ou Avatar do topo */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil" className="w-10 h-10 rounded-full object-cover border border-[#eab308]" />
            ) : (
              <div className="bg-[#eab308] text-black font-black text-lg px-2.5 py-0.5 rounded-sm">
                S+
              </div>
            )}
            <div>
              <span className="text-white font-black text-xl tracking-wider uppercase">PAINEL DO PROFISSIONAL</span>
              <p className="text-xs text-neutral-400">Gerencie seus serviços, solicitações e portfólio</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={onGoToPublicSite}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Ver Site Público
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

      {/* Corpo do Painel */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Menu Lateral */}
        <aside className="space-y-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center justify-between p-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'requests' 
                ? 'bg-[#eab308] text-black' 
                : 'bg-[#18181b] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Solicitações / Mensagens</span>
            </div>
            {requests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'requests' ? 'bg-black text-white' : 'bg-[#eab308] text-black'}`}>
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-2.5 p-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'gallery' 
                ? 'bg-[#eab308] text-black' 
                : 'bg-[#18181b] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeria de Trabalhos</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 p-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-[#eab308] text-black' 
                : 'bg-[#18181b] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações do Perfil</span>
          </button>
        </aside>

        {/* Conteúdo da Aba Ativa */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="p-12 text-center text-neutral-400">Carregando dados...</div>
          ) : (
            <>
              {/* ABA: SOLICITAÇÕES */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Solicitações Recebidas</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Pedidos de orçamento enviados por clientes. Aceite para abrir o chat de conversa estilo WhatsApp.
                    </p>
                  </div>

                  {requests.length === 0 ? (
                    <div className="bg-[#18181b] border border-neutral-800 p-12 text-center rounded-lg">
                      <p className="text-neutral-400 font-medium">Você ainda não recebeu nenhuma mensagem ou solicitação.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((req) => (
                        <div key={req.id} className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg space-y-3">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded ${
                              req.status === 'ACEITO' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-500/10 text-[#eab308] border border-yellow-500/20'
                            }`}>
                              {req.status || 'PENDENTE'}
                            </span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <p className="text-sm text-neutral-200 leading-relaxed font-medium">{req.description}</p>
                          
                          <div className="text-xs text-neutral-400">
                            Prazo solicitado: <span className="text-white font-bold">{req.when_needed}</span>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            {req.status === 'ACEITO' ? (
                              <button 
                                key={`chat-btn-${req.id}`}
                                onClick={() => setSelectedChatRequest(req)}
                                className="bg-[#00a884] hover:bg-[#008f70] text-black font-black uppercase text-xs px-4 py-2.5 rounded flex items-center gap-2 transition cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>Abrir Chat WhatsApp</span>
                              </button>
                            ) : (
                              <button 
                                key={`accept-btn-${req.id}`}
                                onClick={() => handleAcceptRequest(req.id)}
                                className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-2.5 rounded flex items-center gap-2 transition cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Aceitar Trabalho</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: GALERIA DE TRABALHOS */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Galeria de Trabalhos</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Adicione fotos de serviços concluídos selecionando arquivos da sua galeria.
                    </p>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={galleryFileInputRef}
                    onChange={handleGalleryUpload}
                    className="hidden" 
                  />

                  <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Adicionar nova foto ao portfólio</h4>
                      <p className="text-xs text-neutral-400">Escolha uma imagem da sua galeria para exibir no seu perfil público.</p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      disabled={uploadingGallery}
                      className="bg-[#eab308] text-black font-black uppercase text-xs px-5 py-3 rounded flex items-center gap-2 hover:bg-yellow-500 transition cursor-pointer shrink-0"
                    >
                      {uploadingGallery ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Selecionar Foto</span>
                    </button>
                  </div>

                  {gallery.length === 0 ? (
                    <div className="bg-[#18181b] border border-neutral-800 p-12 text-center rounded-lg text-neutral-400 text-xs">
                      Nenhuma foto adicionada à sua galeria ainda.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {gallery.map((imgUrl, idx) => (
                        <div key={idx} className="relative group bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 h-44">
                          <img src={imgUrl} alt={`Trabalho ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded hover:bg-red-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Remover foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: CONFIGURAÇÕES DE PERFIL */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Configurações do Perfil</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Mantenha suas informações, foto de perfil e valores atualizados.
                    </p>
                  </div>

                  {/*Input oculto para foto de perfil */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={avatarFileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden" 
                  />

                  {/* CARD DA FOTO DE PERFIL */}
                  <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-neutral-900 border-2 border-[#eab308] shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-neutral-600" />
                      )}

                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Camera className="w-5 h-5 mb-1" />
                        <span>Alterar</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-white uppercase">Foto de Perfil</h3>
                      <p className="text-xs text-neutral-400 max-w-md">
                        Esta foto será exibida no seu perfil público para que os clientes identifiquem você.
                      </p>
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded transition cursor-pointer inline-flex items-center gap-2"
                      >
                        {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{avatarUrl ? 'Substituir Foto' : 'Carregar Foto'}</span>
                      </button>
                    </div>
                  </div>

                  {/* OUTROS DADOS DO PERFIL */}
                  <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Nome Completo</label>
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Categoria</label>
                        <input 
                          type="text" 
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Cidade / Estado</label>
                        <input 
                          type="text" 
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Preço Inicial (R$)</label>
                        <input 
                          type="number" 
                          required
                          value={priceStartingAt}
                          onChange={(e) => setPriceStartingAt(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Sobre Você / Biografia</label>
                      <textarea 
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-6 py-3 rounded flex items-center gap-2 transition cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                  </button>
                </form>
              )}

            </>
          )}
        </main>

      </div>

      {/* Modal do Chat estilo WhatsApp */}
      {selectedChatRequest && (
        <ChatModal 
          request={selectedChatRequest}
          currentUserType="professional"
          senderName={profile?.full_name || 'Profissional'}
          onClose={() => setSelectedChatRequest(null)}
        />
      )}

    </div>
  )
}
