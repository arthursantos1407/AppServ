import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export function CustomAlert({ isOpen, type = 'info', title, message, onClose }) {
  if (!isOpen) return null

  // Configuração de Ícones e Cores de Acordo com o Tipo
  const alertStyles = {
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />,
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      btn: 'bg-emerald-500 hover:bg-emerald-600 text-black',
      defaultTitle: 'Sucesso!'
    },
    error: {
      icon: <XCircle className="w-6 h-6 text-red-400 shrink-0" />,
      border: 'border-red-500/30',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
      btn: 'bg-red-500 hover:bg-red-600 text-white',
      defaultTitle: 'Atenção / Erro'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />,
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      btn: 'bg-[#eab308] hover:bg-yellow-500 text-black',
      defaultTitle: 'Aviso'
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-400 shrink-0" />,
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      btn: 'bg-blue-500 hover:bg-blue-600 text-white',
      defaultTitle: 'Informação'
    }
  }

  const currentStyle = alertStyles[type] || alertStyles.info

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`bg-[#18181b] border ${currentStyle.border} rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-white space-y-5 transform transition-all scale-100`}>
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Conteúdo */}
        <div className="flex items-start gap-4 pt-1">
          {currentStyle.icon}
          <div className="space-y-1">
            <h3 className="text-base font-black text-white leading-tight">
              {title || currentStyle.defaultTitle}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Botão de Confirmação */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${currentStyle.btn}`}
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  )
}