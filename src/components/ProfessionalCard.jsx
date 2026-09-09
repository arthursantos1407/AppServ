import React from "react";
import { Star, MapPin, Briefcase } from "lucide-react";

export function ProfessionalCard({ professional, onSelect }) {
  return (
    <div className="bg-[#18181b] border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between transition hover:border-neutral-700">
      <div>
        {/* Imagem + Badge */}
        <div className="relative h-56 overflow-hidden">
          {professional.available_today && (
            <span className="absolute top-3 left-3 z-10 bg-black/80 text-[#eab308] text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider border border-[#eab308]/30">
              Disponível Hoje
            </span>
          )}
          <img
            src={professional.avatar_url}
            alt={professional.full_name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Informações Principais */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#eab308] text-xs font-black tracking-wider uppercase">
              {professional.category}
            </span>
            <div className="flex items-center gap-1 text-[#eab308] text-sm font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{Number(professional.rating).toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-white font-black text-xl tracking-tight mb-3">
            {professional.full_name}
          </h3>

          <div className="space-y-1.5 text-neutral-400 text-xs font-medium mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>{professional.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
              <span>{professional.experience_years} anos de experiência</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com Preço e Ação */}
      <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-2">
        <div>
          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
            A partir de
          </p>
          <p className="text-white font-black text-lg">
            R${" "}
            {Number(professional.price_starting_at)
              .toFixed(2)
              .replace(".", ",")}
          </p>
        </div>

        <button
          onClick={() => onSelect(professional)}
          className="border-2 border-[#eab308] text-[#eab308] hover:bg-[#eab308] hover:text-black font-extrabold text-xs px-4 py-2 rounded uppercase tracking-wider transition"
        >
          Ver Perfil
        </button>
      </div>
    </div>
  );
}
