import React, { useState } from "react";
import { createProfile } from "../services/profiles";

export function RegisterView({ onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: "",
    category: "Eletricista",
    experience_years: "",
    services_text: "",
    location: "",
    price_starting_at: "",
    bio: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Converte os serviços em formato array jsonb
    const servicesArray = formData.services_text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((srv) => ({
        name: srv.trim(),
        price: Number(formData.price_starting_at) || 100,
      }));

    const newProfile = {
      full_name: formData.full_name,
      category: formData.category,
      experience_years: Number(formData.experience_years) || 1,
      location: formData.location,
      city: "São Paulo",
      price_starting_at: Number(formData.price_starting_at) || 100,
      bio: formData.bio,
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600",
      services: servicesArray,
      verified: true,
    };

    try {
      await createProfile(newProfile);
      alert("Perfil cadastrado com sucesso!");
      onSuccess();
    } catch (err) {
      alert(
        "Erro ao salvar no Supabase. Verifique se as credenciais estão configuradas.",
      );
    }
  };

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#eab308] uppercase tracking-widest">
          PARA PROFISSIONAIS
        </span>
        <h1 className="text-4xl font-black tracking-tight mt-1 mb-8">
          SUA CARREIRA COMEÇA AQUI.
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#18181b] border border-neutral-800 p-8 rounded-lg space-y-6"
        >
          <h2 className="text-xl font-black tracking-tight border-b border-neutral-800 pb-4">
            CRIE SEU PERFIL
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Menezes"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Área de Atuação
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#eab308]"
              >
                <option>Eletricista</option>
                <option>Encanador</option>
                <option>Pintor</option>
                <option>Pedreiro</option>
                <option>Diarista</option>
                <option>Jardineiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Anos de Experiência
              </label>
              <input
                type="number"
                placeholder="Ex: 12"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#eab308]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Serviços Oferecidos (um por linha)
            </label>
            <textarea
              rows={3}
              placeholder="Liste os serviços..."
              value={formData.services_text}
              onChange={(e) =>
                setFormData({ ...formData, services_text: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Local de Atendimento
              </label>
              <input
                type="text"
                placeholder="Ex: Vila Mariana, São Paulo"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#eab308]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Valor Aproximado (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 120"
                value={formData.price_starting_at}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_starting_at: e.target.value,
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#eab308]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Descrição do Serviço
            </label>
            <textarea
              rows={4}
              placeholder="Conte como você trabalha, garantia, etc..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded text-sm hover:bg-yellow-500 transition"
          >
            Cadastrar Perfil
          </button>
        </form>
      </div>
    </div>
  );
}
