import React, { useState } from "react";
import { ProfessionalCard } from "./ProfessionalCard";

export function ProfessionalsView({
  profiles,
  categoryFilter,
  setCategoryFilter,
  onSelectProfessional,
}) {
  const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'price_asc' | 'price_desc'

  // Ordenação dinâmica dos perfis
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (sortBy === "rating") {
      return Number(b.rating) - Number(a.rating);
    }
    if (sortBy === "price_asc") {
      return Number(a.price_starting_at) - Number(b.price_starting_at);
    }
    if (sortBy === "price_desc") {
      return Number(b.price_starting_at) - Number(a.price_starting_at);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Cabeçalho de Resultados e Ordenação (Exatamente como no vídeo a 00:03) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            {categoryFilter ? `CATEGORIA: ${categoryFilter}` : "RESULTADOS"}
          </span>
          <h1 className="text-4xl font-black tracking-tight mt-1">
            PROFISSIONAIS
          </h1>
          <p className="text-sm text-neutral-400">
            {sortedProfiles.length} profissionais encontrados • São Paulo
          </p>
        </div>

        <div className="flex items-center gap-4">
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-xs font-bold text-[#eab308] underline cursor-pointer"
            >
              Limpar filtro
            </button>
          )}

          {/* Select de Ordenação do Vídeo */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Ordenar:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#18181b] border border-neutral-800 text-xs text-white font-bold px-3 py-2 rounded focus:outline-none focus:border-[#eab308]"
            >
              <option value="rating">Melhor avaliação</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      {sortedProfiles.length === 0 ? (
        <div className="bg-[#18181b] border border-neutral-800 p-12 text-center rounded-lg">
          <p className="text-neutral-400 font-medium">
            Nenhum profissional encontrado para este filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedProfiles.map((prof) => (
            <ProfessionalCard
              key={prof.id}
              professional={prof}
              onSelect={onSelectProfessional}
            />
          ))}
        </div>
      )}
    </div>
  );
}
