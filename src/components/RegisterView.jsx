import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { User, Briefcase, ArrowLeft, Loader2, CheckCircle, Camera, Upload, Trash2 } from 'lucide-react'

export function RegisterView({ onSuccess }) {
  const [role, setRole] = useState(null) // null | 'client' | 'professional'
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Campos comuns
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Campos específicos do profissional
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [priceStartingAt, setPriceStartingAt] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [bio, setBio] = useState('')

  const avatarFileInputRef = useRef(null)

  const handleAvatarUpload = async (e) => {
    try {
      setUploadingAvatar(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      alert('Erro ao carregar a imagem. Certifique-se de que o bucket "avatars" existe e é público.')
      console.error(error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = ''
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        const profilePayload = {
          id: authData.user.id,
          full_name: fullName,
          email: email,
          role: role,
          ...(role === 'professional' && {
            avatar_url: avatarUrl || null,
            category: category || null,
            city: city || null,
            location: city || null,
            price_starting_at: parseFloat(priceStartingAt) || 0,
            years_of_experience: parseInt(yearsOfExperience) || 0,
            bio: bio || null,
          }),
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload)

        if (profileError) throw profileError

        alert('Conta criada com sucesso!')
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Erro ao realizar cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {!role && (
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Criar Conta</h2>
            <p className="text-sm text-neutral-400 mt-2">
              Selecione como deseja utilizar a plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setRole('client')}
              className="bg-[#18181b] border-2 border-neutral-800 hover:border-[#00a884] p-8 rounded-2xl flex flex-col items-center gap-4 transition group cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#00a884]/10 text-[#00a884] flex items-center justify-center group-hover:scale-110 transition">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase">Quero Contratar</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Procure profissionais qualificados e solicite orçamentos.
                </p>
              </div>
              <span className="mt-2 bg-[#00a884] text-black font-black text-xs px-4 py-2 rounded-lg uppercase">
                Sou Cliente
              </span>
            </button>

            <button
              onClick={() => setRole('professional')}
              className="bg-[#18181b] border-2 border-neutral-800 hover:border-[#eab308] p-8 rounded-2xl flex flex-col items-center gap-4 transition group cursor-pointer text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#eab308]/10 text-[#eab308] flex items-center justify-center group-hover:scale-110 transition">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase">Quero Trabalhar</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Divulgue seus serviços e receba solicitações de clientes.
                </p>
              </div>
              <span className="mt-2 bg-[#eab308] text-black font-black text-xs px-4 py-2 rounded-lg uppercase">
                Sou Profissional
              </span>
            </button>
          </div>
        </div>
      )}

      {role && (
        <div className="bg-[#18181b] border border-neutral-800 p-8 rounded-2xl space-y-6">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white uppercase transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Alterar tipo de conta
          </button>

          <div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded ${
              role === 'client' ? 'bg-[#00a884]/20 text-[#00a884]' : 'bg-[#eab308]/20 text-[#eab308]'
            }`}>
              {role === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Profissional'}
            </span>
            <h2 className="text-2xl font-black uppercase text-white mt-2">
              {role === 'client' ? 'Crie a sua conta de Cliente' : 'Crie o seu perfil Profissional'}
            </h2>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {role === 'professional' && (
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={avatarFileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden" 
                />

                <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-[#eab308] overflow-hidden flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-neutral-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <label className="block text-xs font-bold uppercase text-neutral-400">
                    Foto de Perfil do Profissional
                  </label>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="bg-[#eab308] hover:bg-yellow-500 text-black font-bold text-xs px-4 py-2 rounded transition flex items-center gap-2 cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{avatarUrl ? 'Alterar Foto' : 'Selecionar Foto'}</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded transition cursor-pointer"
                        title="Remover Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Palavra-passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
              />
            </div>

            {role === 'professional' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Categoria</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Eletricista"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Cidade / Estado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lisboa, Porto"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Preço Inicial (€ / R$)</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={priceStartingAt}
                      onChange={(e) => setPriceStartingAt(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Anos de Experiência</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Ex: 5"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Biografia / Resumo dos Serviços</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a sua experiência..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-black uppercase text-xs py-3.5 rounded transition flex items-center justify-center gap-2 cursor-pointer mt-4 ${
                role === 'client' 
                  ? 'bg-[#00a884] hover:bg-[#008f70] text-black' 
                  : 'bg-[#eab308] hover:bg-yellow-500 text-black'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Cadastro</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default RegisterView;