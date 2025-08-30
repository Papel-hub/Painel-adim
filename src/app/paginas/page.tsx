"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { FaFileAlt, FaEdit, FaPlus } from "react-icons/fa";

interface Pagina {
  id: string;
  updatedAt?: Date | null;
}

export default function GestaoPaginas() {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Logout
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/login";
    }
  };

  // Wrapper de layout
  const MainWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );

  // Carregar páginas
  const carregarPaginas = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pages"));
      const lista: Pagina[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
        };
      });
      setPaginas(lista);
    } catch (error) {
      console.error("Erro ao carregar páginas:", error);
      alert("Erro ao carregar as páginas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPaginas();
  }, []);

  // Criar nova página
  const criarNovaPagina = () => {
    const nome = prompt("Digite o nome da nova página (ex: sobre, contato):");
    if (!nome) return;

    const slug = nome.trim().toLowerCase().replace(/\s+/g, "-");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      alert("Use apenas letras, números e hífens.");
      return;
    }

    router.push(`/paginas/editar/${slug}`);
  };

  // Editar página
  const editarPagina = (id: string) => {
    router.push(`/paginas/editar/${id}`);
  };

  return (
    <MainWrapper>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaFileAlt className="text-indigo-600" />
          Gestão de Páginas do Site
        </h1>
        <ConnectionStatus />
      </header>

      <div className="mb-6">
        <button
          onClick={criarNovaPagina}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
        >
          <FaPlus size={14} /> Nova Página
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-600">Carregando páginas...</span>
          </div>
        ) : paginas.length === 0 ? (
          <p className="text-center text-slate-500 py-10">Nenhuma página encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Página</th>
                  <th className="text-left py-3 px-4">Última Edição</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginas.map((pagina) => (
                  <tr
                    key={pagina.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-mono text-sm text-slate-800">
                      {pagina.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pagina.updatedAt
                        ? pagina.updatedAt.toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => editarPagina(pagina.id)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition"
                      >
                        <FaEdit size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainWrapper>
  );
}
