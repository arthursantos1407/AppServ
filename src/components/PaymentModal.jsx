import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { QrCode, CreditCard, FileText, Copy, Check, Loader2, X, AlertCircle, ExternalLink } from 'lucide-react'

export function PaymentModal({ requestId, amount, professionalId, clientId, onClose }) {
  const [method, setMethod] = useState('pix') // 'pix' | 'boleto' | 'credit_card'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Resultado do pagamento
  const [paymentResult, setPaymentResult] = useState(null)

  // Dados do Boleto / Pagador
  const [payer, setPayer] = useState({
    name: '',
    email: '',
    cpf: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP'
  })

  // Dados do Cartão
  const [card, setCard] = useState({
    number: '',
    holderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    installments: '1'
  })

  // 1. Processar Pix
  const handleProcessPix = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-pix', {
        body: {
          requestId,
          amount,
          professionalId,
          clientId,
          paymentMethod: 'pix'
        }
      })

      if (fnError) throw new Error(fnError.message)
      if (!data?.success) throw new Error(data?.error || 'Erro ao gerar Pix.')

      setPaymentResult({ type: 'pix', pixCode: data.pixCode })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. Processar Boleto
  const handleProcessBoleto = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-pix', {
        body: {
          requestId,
          amount,
          professionalId,
          clientId,
          paymentMethod: 'boleto',
          payerData: {
            name: payer.name,
            email: payer.email,
            cpf: payer.cpf,
            address: {
              zip_code: payer.zipCode,
              street_name: payer.street,
              street_number: payer.number,
              neighborhood: payer.neighborhood,
              city: payer.city,
              federal_unit: payer.state
            }
          }
        }
      })

      if (fnError) throw new Error(fnError.message)
      if (!data?.success) throw new Error(data?.error || 'Erro ao gerar boleto.')

      setPaymentResult({
        type: 'boleto',
        boletoUrl: data.boletoUrl,
        barcode: data.boletoBarcode
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. Processar Cartão de Crédito
  const handleProcessCard = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY
      if (!publicKey || !window.MercadoPago) {
        throw new Error('SDK do Mercado Pago não carregada corretamente.')
      }

      const mp = new window.MercadoPago(publicKey)

      // Tokeniza o cartão com a SDK do Mercado Pago
      const cardTokenResponse = await mp.createCardToken({
        cardNumber: card.number.replace(/\s/g, ''),
        cardholderName: card.holderName,
        cardExpirationMonth: card.expirationMonth,
        cardExpirationYear: card.expirationYear,
        securityCode: card.securityCode,
        identificationType: 'CPF',
        identificationNumber: payer.cpf.replace(/\D/g, '')
      })

      if (!cardTokenResponse?.id) {
        throw new Error('Não foi possível validar os dados do cartão. Verifique o número e o código de segurança.')
      }

      // Envia o token para a Edge Function
      const { data, error: fnError } = await supabase.functions.invoke('create-pix', {
        body: {
          requestId,
          amount,
          professionalId,
          clientId,
          paymentMethod: 'credit_card',
          cardToken: cardTokenResponse.id,
          installments: parseInt(card.installments, 10),
          payerData: {
            email: payer.email,
            cpf: payer.cpf
          }
        }
      })

      if (fnError) throw new Error(fnError.message)
      if (!data?.success) throw new Error(data?.error || 'Pagamento com cartão recusado.')

      setPaymentResult({
        type: 'credit_card',
        status: data.status
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#18181b] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-5 relative max-h-[90vh] overflow-y-auto">
        
        {/* Botão Fechar */}
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div>
          <h3 className="text-lg font-bold">Efetuar Pagamento</h3>
          <p className="text-xs text-neutral-400">Total a pagar: <strong className="text-emerald-400">R$ {parseFloat(amount).toFixed(2)}</strong></p>
        </div>

        {/* Seleção de Métodos (Abas) */}
        {!paymentResult && (
          <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => { setMethod('pix'); setError('') }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                method === 'pix' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" /> Pix
            </button>

            <button
              type="button"
              onClick={() => { setMethod('credit_card'); setError('') }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                method === 'credit_card' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Cartão
            </button>

            <button
              type="button"
              onClick={() => { setMethod('boleto'); setError('') }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                method === 'boleto' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Boleto
            </button>
          </div>
        )}

        {/* Exibição de Erros */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-start gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------------- TELA 1: PIX ---------------- */}
        {method === 'pix' && !paymentResult && (
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-neutral-400">
              O pagamento via Pix é aprovado instantaneamente e o valor fica retido até a conclusão do serviço.
            </p>

            <button
              type="button"
              onClick={handleProcessPix}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerar QR Code Pix'}
            </button>
          </div>
        )}

        {/* ---------------- TELA 2: CARTÃO DE CRÉDITO ---------------- */}
        {method === 'credit_card' && !paymentResult && (
          <form onSubmit={handleProcessCard} className="space-y-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">E-mail do Titular</label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={payer.email}
                onChange={(e) => setPayer({ ...payer, email: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">CPF do Titular</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={payer.cpf}
                onChange={(e) => setPayer({ ...payer, cpf: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Número do Cartão</label>
              <input
                type="text"
                required
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Nome Impresso no Cartão</label>
              <input
                type="text"
                required
                placeholder="NOME COMO NO CARTAO"
                value={card.holderName}
                onChange={(e) => setCard({ ...card, holderName: e.target.value.toUpperCase() })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Mês (MM)</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  placeholder="08"
                  value={card.expirationMonth}
                  onChange={(e) => setCard({ ...card, expirationMonth: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Ano (AA)</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  placeholder="28"
                  value={card.expirationYear}
                  onChange={(e) => setCard({ ...card, expirationYear: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">CVV</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={card.securityCode}
                  onChange={(e) => setCard({ ...card, securityCode: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Parcelas</label>
              <select
                value={card.installments}
                onChange={(e) => setCard({ ...card, installments: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1x de R$ {parseFloat(amount).toFixed(2)} (À vista)</option>
                <option value="2">2x de R$ {(amount / 2).toFixed(2)}</option>
                <option value="3">3x de R$ {(amount / 3).toFixed(2)}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pagar com Cartão'}
            </button>
          </form>
        )}

        {/* ---------------- TELA 3: BOLETO BANCÁRIO ---------------- */}
        {method === 'boleto' && !paymentResult && (
          <form onSubmit={handleProcessBoleto} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={payer.name}
                  onChange={(e) => setPayer({ ...payer, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">CPF</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={payer.cpf}
                  onChange={(e) => setPayer({ ...payer, cpf: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">E-mail para Receber o Boleto</label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={payer.email}
                onChange={(e) => setPayer({ ...payer, email: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">CEP</label>
                <input
                  type="text"
                  required
                  placeholder="00000-000"
                  value={payer.zipCode}
                  onChange={(e) => setPayer({ ...payer, zipCode: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Paulista"
                  value={payer.street}
                  onChange={(e) => setPayer({ ...payer, street: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Número</label>
                <input
                  type="text"
                  required
                  placeholder="100"
                  value={payer.number}
                  onChange={(e) => setPayer({ ...payer, number: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Bairro</label>
                <input
                  type="text"
                  required
                  placeholder="Centro"
                  value={payer.neighborhood}
                  onChange={(e) => setPayer({ ...payer, neighborhood: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  placeholder="São Paulo"
                  value={payer.city}
                  onChange={(e) => setPayer({ ...payer, city: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gerar Boleto Bancário'}
            </button>
          </form>
        )}

        {/* ---------------- EXIBIÇÃO DO RESULTADO DO PAGAMENTO ---------------- */}
        {paymentResult && (
          <div className="space-y-4 text-center py-2">
            {/* PIX GERADO */}
{paymentResult.type === 'pix' && (
  <div className="space-y-4">
    {/* Imagem do QR Code Gerada Automaticamente */}
    <div className="bg-white p-3 rounded-xl max-w-[200px] mx-auto shadow-md">
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentResult.pixCode)}`} 
        alt="QR Code Pix" 
        className="w-full h-auto block rounded" 
      />
    </div>

    <p className="text-xs text-neutral-300">
      Escaneie o QR Code acima ou copie o código abaixo e pague no app do seu banco:
    </p>

    {/* Código Copia e Cola */}
    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 break-all text-[11px] font-mono text-emerald-400 max-h-24 overflow-y-auto">
      {paymentResult.pixCode}
    </div>

    <button
      type="button"
      onClick={() => copyToClipboard(paymentResult.pixCode)}
      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Código Copiado!' : 'Copiar Código Pix'}
    </button>
  </div>
)}

            {/* BOLETO GERADO */}
            {paymentResult.type === 'boleto' && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-300">Boleto gerado com sucesso!</p>
                {paymentResult.barcode && (
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 font-mono text-xs text-emerald-400">
                    {paymentResult.barcode}
                  </div>
                )}
                {paymentResult.boletoUrl && (
                  <a
                    href={paymentResult.boletoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-500 text-black font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition inline-flex"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Boleto em PDF
                  </a>
                )}
              </div>
            )}

            {/* CARTÃO APROVADO */}
            {paymentResult.type === 'credit_card' && (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-400">Pagamento Aprovado!</h4>
                <p className="text-xs text-neutral-400">O valor já está retido em custódia até a conclusão do serviço.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 rounded-lg transition"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default PaymentModal