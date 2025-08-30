"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { toast } from "react-hot-toast";

import { FaDollarSign, FaInfoCircle, FaTrash, FaBox, FaUser } from "react-icons/fa";

interface Produto {
  nome: string;
  qtd: number;
  preco: number;
}

interface Venda {
  id: string;
  clienteNome: string;
  produtos: Produto[];
  total: number;
  data: string; // Agora será string formatada
  pagamentoStatus: string;
}

export default function GestaoVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/login";
    }
  };

  const carregarVendas = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "vendas"));
      const lista: Venda[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedDate = "—";

        if (data.data) {
          const dateObj = data.data instanceof Timestamp ? data.data.toDate() : new Date(data.data);
          formattedDate = dateObj.toLocaleString("pt-BR");
        }

        return {
          id: docSnap.id,
          clienteNome: data.clienteNome || "—",
          produtos: Array.isArray(data.produtos) ? data.produtos : [],
          total: data.total || 0,
          data: formattedDate,
          pagamentoStatus: data.pagamentoStatus || "—",
        };
      });
      setVendas(lista);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      toast.error("Erro ao carregar vendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  const excluirVenda = async (id: string) => {
    if (!confirm("Deseja excluir esta venda?")) return;
    try {
      await deleteDoc(doc(db, "vendas", id));
      toast.success("Venda excluída com sucesso!");
      carregarVendas();
    } catch (error) {
      console.error("Erro ao excluir venda:", error);
      toast.error("Erro ao excluir venda.");
    }
  };

  const verDetalhes = (id: string) => {
    router.push(`/vendas/detalhes/${id}`);
  };

  const getTotalProdutos = (produtos: Produto[]) => {
    return produtos.reduce((acc, p) => acc + (p.qtd || 0), 0);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 flex-1 p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaDollarSign className="text-purple-600" />
            Gestão de Vendas
          </h1>
          <ConnectionStatus />
        </header>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600">Carregando vendas...</span>
            </div>
          ) : vendas.length === 0 ? (
            <p className="text-center text-slate-500 py-10">Nenhuma venda registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase text-sm">
                  <tr>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Produtos</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <FaUser size={16} className="text-slate-400" />
                        {venda.clienteNome}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1">
                          <FaBox size={14} className="text-green-500" />
                          {getTotalProdutos(venda.produtos)} item(s)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        R$ {venda.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{venda.data}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                            ${
                              venda.pagamentoStatus === "pago"
                                ? "bg-green-100 text-green-800"
                                : venda.pagamentoStatus === "pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          `}
                        >
                          {venda.pagamentoStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <button
                          onClick={() => verDetalhes(venda.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Ver detalhes"
                        >
                          <FaInfoCircle size={18} />
                        </button>
                        <button
                          onClick={() => excluirVenda(venda.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Excluir"
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
