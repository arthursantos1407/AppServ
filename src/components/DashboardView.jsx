import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Clock, CheckCircle2, MessageSquare } from "lucide-react";

export function DashboardView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*, profiles(full_name, category)")
      .order("created_at", { ascending: false });

    if (!error) {
      setRequests(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-white">
      <span className="text-xs font-bold text-[#eab308] uppercase tracking-widest">
        PAINEL DO PROFISSIONAL
      </span>
      <h1 className="text-4xl font-black tracking-tight mt-1 mb-8">
        SOLICITAÇÕES RECEBIDAS
      </h1>

      {loading ? (
        <p className="text-neutral-400">Carregando solicitações...</p>
      ) : requests.length === 0 ? (
        <div className="bg-[#18181b] border border-neutral-800 p-10 rounded text-center">
          <p className="text-neutral-400">
            Nenhuma solicitação recebida até o momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-[#18181b] border border-neutral-800 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#eab308] uppercase">
                    {req.profiles?.full_name || "Profissional"}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{" "}
                    {new Date(req.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-200">
                  {req.description}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Urgência:{" "}
                  <span className="text-neutral-300 font-bold">
                    {req.when_needed}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase px-3 py-1 rounded">
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
