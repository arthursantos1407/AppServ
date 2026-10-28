import React from 'react'
import { 
  ShieldCheck, MessageCircle, Lock, 
  HelpCircle, ChevronRight, CheckCircle2
} from 'lucide-react'

export function Footer({ setView }) {
  // Função auxiliar para mudar de página e subir a tela suavemente
  const handleNav = (viewName) => {
    if (setView) setView(viewName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-neutral-800 text-neutral-400 text-xs pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* GRELA PRINCIPAL DO RODAPÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* COLUNA 1 & 2: SOBRE A PLATAFORMA & SELOS DE SEGURANÇA */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-auto">
                <img src="/icon.png" alt="Logo da Plataforma" className="h-full w-auto object-contain" />
              </div>
            </div>
            
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Conectamos clientes que precisam de soluções rápidas aos melhores profissionais autônomos da região. Pagamentos protegidos por custódia e saques facilitados via Pix.
            </p>

            {/* Selos de Garantia e LGPD */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#18181b] border border-neutral-800 px-3 py-1.5 rounded-lg text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Pix Automático</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#18181b] border border-neutral-800 px-3 py-1.5 rounded-lg text-[11px] text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#eab308]" />
                <span>Conforme LGPD</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#18181b] border border-neutral-800 px-3 py-1.5 rounded-lg text-[11px] text-blue-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Custódia Segura</span>
              </div>
            </div>
          </div>

          {/* COLUNA 3: NAVEGAÇÃO RÁPIDA */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-neutral-800 pb-2">
              Navegação
            </h4>
            <ul className="space-y-2 text-neutral-400 font-medium">
              <li>
                <button 
                  onClick={() => handleNav('home')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Página Inicial
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('profissionais')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Encontrar Profissionais
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('cadastrar')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Anunciar Serviços
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('login')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Área do Profissional / Login
                </button>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: INSTITUCIONAL & SEGURANÇA */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-neutral-800 pb-2">
              Institucional
            </h4>
            <ul className="space-y-2 text-neutral-400 font-medium">
              <li>
                <button 
                  onClick={() => handleNav('privacidade')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Política de Privacidade
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('privacidade')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Termos de Uso
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('home')} 
                  className="hover:text-[#eab308] transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-neutral-600" /> Segurança dos Pagamentos
                </button>
              </li>
            </ul>
          </div>

          {/* COLUNA 5: CANAL DE SUPORTE */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-neutral-800 pb-2">
              Suporte Técnico
            </h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Precisa de ajuda com saques, pagamentos ou liberação de orçamentos?
            </p>

            <a
              href="https://wa.me/553298640317?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20em%20rela%C3%A7%C3%A3o%20ao%20meu%20atendimento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#008f70] text-black font-extrabold px-4 py-2.5 rounded-xl transition w-full text-center shadow-md shadow-[#00a884]/10 cursor-pointer text-xs"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

        </div>

        {/* BARRA INFERIOR DE DIREITOS AUTORAIS */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} Plataforma de Serviços. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNav('privacidade')} 
              className="hover:text-neutral-300 transition cursor-pointer"
            >
              Privacidade LGPD
            </button>
            <span>•</span>
            <button 
              onClick={() => handleNav('home')} 
              className="hover:text-neutral-300 transition cursor-pointer"
            >
              Voltar para o topo
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer