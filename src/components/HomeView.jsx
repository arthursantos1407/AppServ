import React from 'react'
import { 
  Zap, Wrench, Paintbrush, Hammer, Home, 
  Trees, Laptop, Car, Scissors, GraduationCap, 
  Dog, Package, Star 
} from 'lucide-react'

const categories = [
  { name: 'ELETRICISTA', count: '128 profissionais', icon: Zap },
  { name: 'ENCANADOR', count: '95 profissionais', icon: Wrench },
  { name: 'PINTOR', count: '74 profissionais', icon: Paintbrush },
  { name: 'PEDREIRO', count: '112 profissionais', icon: Hammer },
  { name: 'DIARISTA', count: '156 profissionais', icon: Home },
  { name: 'JARDINEIRO', count: '89 profissionais', icon: Trees },
  { name: 'TÉC. INFORMÁTICA', count: '67 profissionais', icon: Laptop },
  { name: 'MECÂNICO', count: '45 profissionais', icon: Car },
  { name: 'BARBEIRO', count: '59 profissionais', icon: Scissors },
  { name: 'PROFESSOR', count: '42 profissionais', icon: GraduationCap },
  { name: 'CUIDADOR DE ANIMAIS', count: '33 profissionais', icon: Dog },
  { name: 'MONTADOR DE MÓVEIS', count: '51 profissionais', icon: Package },
]

export function HomeView({ profiles, onSelectCategory, onSelectProfessional, setView }) {
  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Banner */}
      <section className="bg-[#0e0e0e] text-white pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-left">
          <span className="text-xs font-bold tracking-widest text-[#eab308] uppercase bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/20">
            PLATAFORMA DE SERVIÇOS
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mt-6 leading-none uppercase">
            QUEM PRECISA <br />
            <span className="text-[#eab308]">ENCONTRA.</span> QUEM SABE <br />
            FAZ.
          </h1>
          <p className="mt-6 text-neutral-400 text-base max-w-xl font-normal leading-relaxed">
            Um lugar para comparar profissionais por experiência, localização, preço e avaliação – e fechar o serviço sem depender de indicação.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => setView('profissionais')} 
              className="bg-[#eab308] text-black font-black uppercase text-xs tracking-wider px-6 py-3.5 rounded hover:bg-yellow-500 transition cursor-pointer"
            >
              Encontrar um serviço
            </button>
            <button 
              onClick={() => setView('cadastrar')} 
              className="bg-[#18181b] border border-neutral-700 text-white font-black uppercase text-xs tracking-wider px-6 py-3.5 rounded hover:bg-neutral-800 transition cursor-pointer"
            >
              Sou profissional
            </button>
          </div>
        </div>
      </section>

      {/* Secção 01 - CATEGORIAS */}
      <section id="categorias" className="max-w-7xl mx-auto px-4 scroll-mt-24">
        <div className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">01 — CATEGORIAS</span>
            <h2 className="text-3xl font-black tracking-tight mt-1 text-white uppercase">ESCOLHA A ÁREA</h2>
          </div>
          <button 
            onClick={() => setView('profissionais')} 
            className="text-xs font-bold text-neutral-400 hover:text-[#eab308] uppercase tracking-wider transition cursor-pointer"
          >
            VER TODAS →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon
            return (
              <div 
                key={idx}
                onClick={() => onSelectCategory(cat.name)}
                className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg hover:border-[#eab308] transition cursor-pointer group"
              >
                <IconComponent className="w-8 h-8 text-[#eab308] mb-4 group-hover:scale-110 transition" />
                <h3 className="font-black text-sm text-white group-hover:text-[#eab308] transition">{cat.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{cat.count}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Secção 02 - PROFISSIONAIS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-8 border-b border-neutral-800 pb-4">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">02 — EM DESTAQUE</span>
          <h2 className="text-3xl font-black tracking-tight mt-1 text-white uppercase">COMPARE E ESCOLHA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.slice(0, 3).map(prof => (
            <div key={prof.id} className="bg-[#18181b] border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between">
              <div className="relative">
                <img src={prof.avatar_url} alt={prof.full_name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded flex items-center gap-1 text-xs font-bold text-[#eab308]">
                  <Star className="w-3.5 h-3.5 fill-[#eab308]" />
                  <span>{Number(prof.rating).toFixed(1)}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#eab308] bg-yellow-500/10 px-2 py-0.5 rounded">
                    {prof.category}
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">{prof.full_name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{prof.city}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">A partir de</span>
                    <span className="text-lg font-black text-white">R$ {prof.price_starting_at}</span>
                  </div>
                  <button 
                    onClick={() => onSelectProfessional(prof)} 
                    className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-2 rounded transition cursor-pointer"
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secção 03 - COMO FUNCIONA */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 scroll-mt-24">
        <div className="mb-8 border-b border-neutral-800 pb-4">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">03 — COMO FUNCIONA</span>
          <h2 className="text-3xl font-black tracking-tight mt-1 text-white uppercase">DO PEDIDO AO CONTATO</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg">
            <span className="text-4xl font-black text-[#eab308] block mb-2">01</span>
            <h3 className="font-bold text-white uppercase text-sm mb-1">PROCURE</h3>
            <p className="text-xs text-neutral-400">Escolha a categoria e localize os profissionais perto de você.</p>
          </div>
          <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg">
            <span className="text-4xl font-black text-[#eab308] block mb-2">02</span>
            <h3 className="font-bold text-white uppercase text-sm mb-1">COMPARE</h3>
            <p className="text-xs text-neutral-400">Analise experiência, preço, localização e avaliações.</p>
          </div>
          <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg">
            <span className="text-4xl font-black text-[#eab308] block mb-2">03</span>
            <h3 className="font-bold text-white uppercase text-sm mb-1">SOLICITE</h3>
            <p className="text-xs text-neutral-400">Descreva o serviço e envie a solicitação ao profissional.</p>
          </div>
          <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg">
            <span className="text-4xl font-black text-[#eab308] block mb-2">04</span>
            <h3 className="font-bold text-white uppercase text-sm mb-1">CONTATO</h3>
            <p className="text-xs text-neutral-400">O profissional aceita e vocês fecham os detalhes direto.</p>
          </div>
        </div>
      </section>

    </div>
  )
}