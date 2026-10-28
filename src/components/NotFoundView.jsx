import React from 'react'
import { AlertCircle, Home, Search, ArrowLeft } from 'lucide-react'

export function NotFoundView({ onGoHome, onGoSearch }) {
  return (
    <div className="min-h-[80vh] bg-[#0e0e0e] text-white flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Ícone e Código 404 */}
        <div className="relative inline-block">
          <span className="text-7xl sm:text-8xl font-black text-neutral-800 tracking-widest block select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#eab308]/20 border border-[#eab308]/40 p-4 rounded-2xl text-[#eab308] shadow-lg shadow-yellow-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Textos Informativos */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Página Não Encontrada
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
            O endereço que você tentou acessar não existe ou foi movido para um novo local.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="bg-[#eab308] hover:bg-yellow-500 text-black font-extrabold text-xs uppercase px-5 py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </button>

          <button
            onClick={onGoSearch}
            className="bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-extrabold text-xs uppercase px-5 py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Buscar Serviços
          </button>
        </div>

      </div>
    </div>
  )
}

export default NotFoundView