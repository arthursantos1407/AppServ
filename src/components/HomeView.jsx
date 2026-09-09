import React from "react";
import {
  Search,
  Zap,
  Droplet,
  Paintbrush,
  Hammer,
  Sparkles,
  Trees,
  Monitor,
  Wrench,
  Scissors,
  BookOpen,
  Dog,
  Package,
} from "lucide-react";
import { ProfessionalCard } from "./ProfessionalCard";

const CATEGORIES = [
  { name: "ELETRICISTA", count: 126, icon: Zap },
  { name: "ENCANADOR", count: 98, icon: Droplet },
  { name: "PINTOR", count: 74, icon: Paintbrush },
  { name: "PEDREIRO", count: 112, icon: Hammer },
  { name: "DIARISTA", count: 180, icon: Sparkles },
  { name: "JARDINEIRO", count: 65, icon: Trees },
  { name: "TÉC. INFORMÁTICA", count: 89, icon: Monitor },
  { name: "MECÂNICO", count: 54, icon: Wrench },
  { name: "BARBEIRO", count: 59, icon: Scissors },
  { name: "PROFESSOR", count: 42, icon: BookOpen },
  { name: "CUIDADOR DE ANIMAIS", count: 33, icon: Dog },
  { name: "MONTADOR DE MÓVEIS", count: 78, icon: Package },
];

export function HomeView({
  profiles,
  onSelectCategory,
  onSelectProfessional,
  setView,
}) {
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
          <span className="w-2 h-2 bg-[#eab308] rounded-full"></span>
          PLATAFORMA DE SERVIÇOS
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          QUEM PRECISA <span className="text-[#eab308]">ENCONTRA.</span>
          <br />
          QUEM SABE <span className="text-white">FAZ.</span>
        </h1>

        <p className="text-neutral-400 text-lg max-w-2xl mb-8">
          Um lugar para comparar profissionais por experiência, localização,
          preço e avaliação — e fechar o serviço sem depender de indicação.
        </p>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={() => setView("profissionais")}
            className="bg-[#eab308] text-black font-bold px-6 py-3.5 rounded text-sm hover:bg-yellow-500 transition"
          >
            Encontrar um serviço
          </button>
          <button
            onClick={() => setView("cadastrar")}
            className="border border-neutral-700 text-white font-bold px-6 py-3.5 rounded text-sm hover:border-neutral-500 transition"
          >
            Sou profissional
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="bg-[#18181b] border border-neutral-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              O que você precisa?
            </label>
            <input
              type="text"
              placeholder="Eletricista, diarista, jardineiro..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Cidade
            </label>
            <input
              type="text"
              defaultValue="São Paulo"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setView("profissionais")}
              className="w-full bg-[#eab308] text-black font-black tracking-wider uppercase py-2.5 rounded text-sm hover:bg-yellow-500 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Categorias (Branco igual ao vídeo) */}
      <section className="bg-neutral-100 py-16 px-4 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                01 — CATEGORIAS
              </span>
              <h2 className="text-3xl font-black tracking-tight mt-1">
                ESCOLHA A ÁREA
              </h2>
            </div>
            <button
              onClick={() => setView("profissionais")}
              className="text-xs font-bold uppercase tracking-wider underline hover:text-yellow-600"
            >
              Ver Todas →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectCategory(cat.name)}
                  className="bg-white border border-neutral-200 p-5 rounded-lg hover:shadow-md transition cursor-pointer flex flex-col justify-between h-32"
                >
                  <Icon className="w-6 h-6 text-black" />
                  <div>
                    <h3 className="font-black text-sm tracking-wide">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {cat.count} profissionais
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção Em Destaque (Cartões Escuros) */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            02 — EM DESTAQUE
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">
            COMPARE E ESCOLHA
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.slice(0, 3).map((prof) => (
            <ProfessionalCard
              key={prof.id}
              professional={prof}
              onSelect={onSelectProfessional}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
