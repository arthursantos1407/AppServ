import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar({ currentView, setView, onNavigateSection, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMobileMenuOpen(false)

  const handleNavigateHome = () => {
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    closeMenu()
  }

  const handleNavigateSection = (sectionId) => {
    onNavigateSection(sectionId)
    closeMenu()
  }

  const handleNavigateProfissionais = () => {
    setView('profissionais')
    closeMenu()
  }

  const handleNavigateView = (view) => {
    setView(view)
    closeMenu()
  }

  return (
    <header className="bg-[#0a0a0a] border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo SERVI+ */}
        <div 
          onClick={handleNavigateHome} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="h-auto w-40">
            <img src="public/icon.png" alt="Logo" />
          </div>
        </div>

        {/* Links de Navegação (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 font-bold uppercase tracking-wider text-xs">
          <button 
            onClick={handleNavigateHome} 
            className={`${currentView === 'home' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'} transition cursor-pointer`}
          >
            ENCONTRAR
          </button>

          <button 
            onClick={() => handleNavigateSection('categorias')} 
            className="text-neutral-300 hover:text-[#eab308] transition cursor-pointer"
          >
            CATEGORIAS
          </button>

          <button 
            onClick={handleNavigateProfissionais} 
            className={`${currentView === 'profissionais' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'} transition cursor-pointer`}
          >
            PROFISSIONAIS
          </button>

          <button 
            onClick={() => handleNavigateSection('como-funciona')} 
            className="text-neutral-300 hover:text-[#eab308] transition cursor-pointer"
          >
            COMO FUNCIONA
          </button>
        </nav>

        {/* Botões de Acesso e Perfil (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => handleNavigateView('portal')}
              className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-2 rounded transition cursor-pointer"
            >
              Meu Painel
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleNavigateView('login')}
                className="text-neutral-300 hover:text-white text-xs font-bold uppercase px-3 py-2 transition cursor-pointer"
              >
                Entrar
              </button>

              <button
                onClick={() => handleNavigateView('cadastrar')}
                className="bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-2.5 rounded transition cursor-pointer"
              >
                Criar Conta
              </button>
            </>
          )}
        </div>

        {/* Botão Hambúrguer (Mobile) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={toggleMenu}
            className="text-neutral-300 hover:text-white p-2 focus:outline-none cursor-pointer"
            aria-label="Abrir Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#eab308]" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </div>

      {/* Menu Desdobrável (Mobile) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-neutral-800 px-4 pt-2 pb-6 space-y-4 font-bold uppercase tracking-wider text-xs">
          <button 
            onClick={handleNavigateHome} 
            className={`block w-full text-left py-2 ${currentView === 'home' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'}`}
          >
            ENCONTRAR
          </button>

          <button 
            onClick={() => handleNavigateSection('categorias')} 
            className="block w-full text-left py-2 text-neutral-300 hover:text-[#eab308]"
          >
            CATEGORIAS
          </button>

          <button 
            onClick={handleNavigateProfissionais} 
            className={`block w-full text-left py-2 ${currentView === 'profissionais' ? 'text-[#eab308]' : 'text-neutral-300 hover:text-white'}`}
          >
            PROFISSIONAIS
          </button>

          <button 
            onClick={() => handleNavigateSection('como-funciona')} 
            className="block w-full text-left py-2 text-neutral-300 hover:text-[#eab308]"
          >
            COMO FUNCIONA
          </button>

          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
            {user ? (
              <button 
                onClick={() => handleNavigateView('portal')}
                className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-3 rounded transition text-center"
              >
                Meu Painel
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigateView('login')}
                  className="w-full border border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold uppercase py-2.5 rounded transition text-center"
                >
                  Entrar
                </button>

                <button
                  onClick={() => handleNavigateView('cadastrar')}
                  className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase text-xs px-4 py-3 rounded transition text-center"
                >
                  Criar Conta
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}