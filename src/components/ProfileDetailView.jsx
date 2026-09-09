import React, { useState } from "react";
import { Star, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { createServiceRequest } from "../services/profiles";

export function ProfileDetailView({ professional, onBack }) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [whenNeeded, setWhenNeeded] = useState("Assim que possível");

  if (!professional) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createServiceRequest(professional.id, description, whenNeeded);
      setRequested(true);
    } catch (err) {
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider hover:text-white mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para resultados
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Informações Principais (2 colunas) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={professional.avatar_url}
                alt={professional.full_name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight">
                    {professional.full_name}
                  </h1>
                  {professional.verified && (
                    <span className="bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/30 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      VERIFICADO
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 font-bold text-sm mt-1">
                  {professional.category} • {professional.experience_years} anos
                  de experiência
                </p>

                {/* Métricas */}
                <div className="grid grid-cols-4 gap-4 mt-6 border-t border-b border-neutral-800 py-4 text-center">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">
                      Avaliação
                    </p>
                    <p className="text-xl font-black text-white">
                      {Number(professional.rating).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">
                      Serviços
                    </p>
                    <p className="text-xl font-black text-white">
                      {professional.completed_services}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">
                      Distância
                    </p>
                    <p className="text-xl font-black text-white">
                      {professional.distance || "3.4 km"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold">
                      Experiência
                    </p>
                    <p className="text-xl font-black text-white">
                      {professional.experience_years} anos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Sobre o Profissional
              </h3>
              <p className="text-neutral-300 leading-relaxed text-sm bg-[#18181b] p-5 rounded-lg border border-neutral-800">
                {professional.bio}
              </p>
            </div>

            {/* Serviços Oferecidos */}
            {professional.services && professional.services.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Serviços Oferecidos
                </h3>
                <div className="bg-[#18181b] rounded-lg border border-neutral-800 divide-y divide-neutral-800">
                  {professional.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex justify-between items-center text-sm"
                    >
                      <span className="font-bold text-neutral-200">
                        {srv.name}
                      </span>
                      <span className="font-black text-[#eab308]">
                        R$ {Number(srv.price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form de Solicitação */}
          <div>
            <div className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg sticky top-28">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                A partir de
              </span>
              <p className="text-3xl font-black text-white mb-1">
                R${" "}
                {Number(professional.price_starting_at)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
              <p className="text-[11px] text-neutral-500 mb-6">
                Valor aproximado • orçamento sem compromisso
              </p>

              {requested ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-5 rounded text-center">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold text-base">Solicitação Enviada!</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Sua solicitação foi gravada no sistema. O profissional
                    entrará em contato em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Descreva o que você precisa
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: trocar a fiação da cozinha e revisar o disjuntor..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Quando
                    </label>
                    <select
                      value={whenNeeded}
                      onChange={(e) => setWhenNeeded(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#eab308]"
                    >
                      <option value="Assim que possível">
                        Assim que possível
                      </option>
                      <option value="Nos próximos 3 dias">
                        Nos próximos 3 dias
                      </option>
                      <option value="Neste fim de semana">
                        Neste fim de semana
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#eab308] hover:bg-yellow-500 text-black font-black uppercase tracking-wider py-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Solicitar Serviço"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
