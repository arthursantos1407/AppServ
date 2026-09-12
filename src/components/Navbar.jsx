import React from 'react'

export function Navbar({ currentView, setView, onNavigateSection }) {
  return (
    <header className="bg-[#0a0a0a] border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo SERVI+ */}
        <div 
          onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-[#eab308] text-black font-black text-xl px-2.5 py-1 rounded-sm">
            S+
          </div>
          <span className="text-white font-black text-2xl tracking-wider">SERVI+</span>
        </div>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-8 font-bold uppercase tracking-wider text-xs">
          <button 
            onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`${currentView === 'home' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'} transition cursor-pointer`}
          >
            ENCONTRAR
          </button>

          <button 
            onClick={() => onNavigateSection('categorias')} 
            className="text-neutral-300 hover:text-[#eab308] transition cursor-pointer"
          >
            CATEGORIAS
          </button>

          <button 
            onClick={() => setView('profissionais')} 
            className={`${currentView === 'profissionais' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'} transition cursor-pointer`}
          >
            PROFISSIONAIS
          </button>

          <button 
            onClick={() => onNavigateSection('como-funciona')} 
            className="text-neutral-300 hover:text-[#eab308] transition cursor-pointer"
          >
            COMO FUNCIONA
          </button>
        </nav>

        {/* Botão Cadastre-se */}
        <div>
          <button 
            onClick={() => setView('cadastrar')} 
            className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded transition cursor-pointer"
          >
            Cadastre-se
          </button>
        </div>

      </div>
    </header>
  )
}