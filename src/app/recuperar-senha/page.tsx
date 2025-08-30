"use client";

import { FaExclamationTriangle, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function AcessoNegado() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-lg w-full text-center border border-red-200">
          <FaExclamationTriangle className="mx-auto text-red-500" size={64} />

          <h1 className="text-3xl font-bold text-red-600 mt-6 mb-4">
            Acesso Negado
          </h1>

          <p className="text-slate-700 mb-4">
            Parece que você esqueceu sua senha ou não tem permissão para acessar esta área.
          </p>

          <p className="text-slate-700 mb-2">Para resolver o problema, você pode:</p>
          <ul className="list-disc pl-5 text-left text-slate-600 text-sm mb-6 space-y-1">
            <li>Entrar em contato com o administrador principal.</li>
            <li>Acessar o painel de controle do Firebase App.</li>
            <li>Se o problema persistir, contate o desenvolvedor.</li>
          </ul>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-left mb-6">
            <p className="text-slate-700 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" />
              <strong>E-mail do Administrador:</strong> talentostore2025@gmail.com
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded transition-colors"
          >
            <FaArrowLeft size={16} /> Voltar para Login
          </Link>
        </div>
      </main>
    </div>
  );
}
