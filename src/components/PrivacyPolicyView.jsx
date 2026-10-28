import React from 'react'
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Server, UserCheck, HelpCircle } from 'lucide-react'

export function PrivacyPolicyView({ onBack }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-neutral-300 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabeçalho */}
        <div className="border-b border-neutral-800 pb-6 space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400 hover:text-[#eab308] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </button>

          <div className="flex items-center gap-3 pt-2">
            <div className="bg-[#eab308]/10 text-[#eab308] p-3 rounded-xl border border-[#eab308]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                POLÍTICA DE PRIVACIDADE
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Última atualização: 28 de Outubro de 2026 • Em conformidade com a LGPD (Lei nº 13.709/2018)
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-8 text-sm leading-relaxed">

          {/* Secção 1 */}
          <section className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#eab308] font-bold text-base">
              <Eye className="w-5 h-5 shrink-0" />
              <h2>1. Informações que Coletamos</h2>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Para viabilizar a conexão entre clientes e profissionais autônomos, coletamos os seguintes dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300 pl-2">
              <li><strong className="text-white">Clientes:</strong> Nome completo, endereço de e-mail e histórico de solicitações de serviços.</li>
              <li><strong className="text-white">Profissionais:</strong> Nome completo, e-mail, foto de perfil, cidade de atuação, categoria profissional, preços iniciais, avaliações e dados de chave Pix (CPF, e-mail, telefone ou chave aleatória) para processamento de saques.</li>
              <li><strong className="text-white">Dados de Pagamento:</strong> Informações de transações Pix intermediadas com gateways parceiros (ex: Mercado Pago). Não armazenamos números de cartão de crédito.</li>
            </ul>
          </section>

          {/* Secção 2 */}
          <section className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#00a884] font-bold text-base">
              <FileText className="w-5 h-5 shrink-0" />
              <h2>2. Finalidade do Uso dos Dados</h2>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Tratamos os seus dados pessoais para as seguintes finalidades legítimas:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300 pl-2">
              <li>Permitir que clientes encontrem e contatem profissionais qualificados na sua região.</li>
              <li>Intermediar conversas em tempo real sobre orçamentos e prazos.</li>
              <li>Garantir a retenção em custódia do valor dos serviços até a confirmação de conclusão.</li>
              <li>Efetuar transferências de saques via Pix para as contas dos profissionais.</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          {/* Secção 3 */}
          <section className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
              <Server className="w-5 h-5 shrink-0" />
              <h2>3. Compartilhamento de Dados com Terceiros</h2>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Não vendemos nem alugamos os seus dados pessoais. O compartilhamento ocorre estritamente com parceiros tecnológicos essenciais:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300 pl-2">
              <li><strong className="text-white">Supabase:</strong> Infraestrutura segura de banco de dados e autenticação de usuários.</li>
              <li><strong className="text-white">Mercado Pago:</strong> Processamento seguro de cobranças Pix e autorização de pagamentos.</li>
              <li><strong className="text-white">Vercel:</strong> Hospedagem e distribuição da aplicação web.</li>
            </ul>
          </section>

          {/* Secção 4 */}
          <section className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
              <UserCheck className="w-5 h-5 shrink-0" />
              <h2>4. Seus Direitos conforme a LGPD</h2>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Como titular dos dados, você tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300 pl-2">
              <li>Confirmação da existência de tratamento de dados.</li>
              <li>Acesso aos seus dados cadastrados.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Eliminação definitiva dos seus dados pessoais da nossa base de dados.</li>
            </ul>
          </section>

          {/* Secção 5 */}
          <section className="bg-[#18181b] border border-neutral-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>5. Segurança das Informações</h2>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Adotamos medidas técnicas e organizacionais rigorosas para proteger seus dados contra acessos não autorizados, perdas ou alterações. Todo o tráfego de dados é criptografado via protocolo HTTPS / SSL.
            </p>
          </section>

          {/* Secção 6 - Contato */}
          <section className="bg-gradient-to-r from-[#18181b] to-[#111b21] border border-neutral-800 rounded-2xl p-6 space-y-3 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <HelpCircle className="w-5 h-5 text-[#00a884]" /> Dúvidas sobre Privacidade?
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Entre em contato com nossa equipe de suporte para exercer seus direitos de privacidade.
              </p>
            </div>
            <a 
              href="https://wa.me/553298640317?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20a%20Pol%C3%ADtica%20de%20Privacidade."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00a884] hover:bg-[#008f70] text-black font-extrabold text-xs px-5 py-3 rounded-xl transition shrink-0 cursor-pointer"
            >
              Falar com Suporte
            </a>
          </section>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyView