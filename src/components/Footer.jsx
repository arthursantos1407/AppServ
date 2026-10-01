import React from "react";

export function Footer({ setView }) {
  return (
    <footer className="bg-[#0a0a0a] border-t border-neutral-800 text-neutral-400 text-xs py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo e Slogan */}
        <div className="flex items-center gap-3">
          <div className="h-auto w-30">
            <img src="/icon.png" alt="" />
          </div>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <p className="hidden sm:block text-neutral-500">
            Conectando quem precisa com quem sabe fazer.
          </p>
        </div>

        {/* Links do Rodapé */}
        <div className="flex items-center gap-6 font-bold uppercase tracking-wider">
          <button className="hover:text-[#eab308] transition">
            <a href="https://wa.me/5532984521595?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20em%20rela%C3%A7%C3%A3o%20ao%20meu%20atendimento."
              target="_blank">
              SUPORTE
            </a>
          </button>
          <button
            onClick={() => setView("home")}
            className="hover:text-[#eab308] transition"
          >
            ENCONTRAR
          </button>
          <button
            onClick={() => setView("profissionais")}
            className="hover:text-[#eab308] transition"
          >
            ANUNCIAR
          </button>
          <button
            onClick={() => setView("home")}
            className="hover:text-[#eab308] transition"
          >
            SOBRE
          </button>
        </div>
      </div>
    </footer>
  );
}
