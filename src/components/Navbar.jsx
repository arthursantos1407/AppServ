import React from "react";

export function Navbar({ currentView, setView }) {
  return (
    <header className="bg-[#0e0e0e] border-b border-neutral-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setView("home")}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="bg-[#eab308] text-black font-black text-xl px-2.5 py-1 rounded-sm">
            S+
          </div>
          <span className="font-black text-2xl tracking-wider">SERVI+</span>
        </div>

        {/* Links de Navegação */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide">
          <button
            onClick={() => setView("home")}
            className={`hover:text-[#eab308] transition ${currentView === "home" ? "text-[#eab308]" : "text-neutral-300"}`}
          >
            ENCONTRAR
          </button>
          <button
            onClick={() => setView("home")}
            className="hover:text-[#eab308] transition text-neutral-300"
          >
            CATEGORIAS
          </button>
          <button
            onClick={() => setView("profissionais")}
            className={`hover:text-[#eab308] transition ${currentView === "profissionais" ? "text-[#eab308]" : "text-neutral-300"}`}
          >
            PROFISSIONAIS
          </button>
          <button
            onClick={() => setView("home")}
            className="hover:text-[#eab308] transition text-neutral-300"
          >
            COMO FUNCIONA
          </button>
        </nav>

        {/* Botão de Cadastro */}
        <button
          onClick={() => setView("cadastrar")}
          className="bg-[#eab308] hover:bg-yellow-500 text-black font-bold px-5 py-2.5 rounded text-sm transition"
        >
          Cadastre-se
        </button>
      </div>
    </header>
  );
}
