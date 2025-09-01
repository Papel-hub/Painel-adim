"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { signOut } from "firebase/auth";
import { FaUser, FaTrash, FaInfoCircle, FaPlus } from "react-icons/fa";

// Interface para Cliente
interface Cliente {
  id: string;
  nome: string;
  createdAt?: string;
  status: "Comprou" | "Pendente";
}

// Componente de badge de status
const StatusBadge = ({ status }: { status: Cliente["status"] }) => {
  const colors = {
    "Comprou": "bg-green-100 text-green-800",
    "Pendente": "bg-yellow-100 text-yellow-800",
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{status}</span>;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar clientes do Firestore
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const lista = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome || "Sem nome",
            createdAt: data.createdAt
              ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
                  .toLocaleDateString("pt-BR")
              : "Nunca",
            status: (data.status as Cliente["status"]) || "Pendente",
          };
        });
        setClientes(lista);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        alert("Erro ao carregar lista de clientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Função de logout
  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  // Função de exclusão de cliente
  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir ${cliente.nome}?`)) return;

    try {
      await deleteDoc(doc(db, "clientes", cliente.id));
      setClientes(prev => prev.filter(c => c.id !== cliente.id));
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Conteúdo Principal */}
      <main className="ml-64 flex-1 p-8">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Clientes
          </h1>
          <ConnectionStatus />
        </header>

        <h2 className="text-lg text-slate-700 mb-6">Lista de clientes cadastrados:</h2>

        {/* Botão de adicionar cliente */}
        <div className="mb-6">
          <a
            href="/clientes/novo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            <FaPlus size={14} /> Novo Cliente
          </a>
        </div>

        {/* Tabela de clientes */}
        {loading ? (
          <div role="status" className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600">Carregando clientes...</span>
          </div>
        ) : clientes.length === 0 ? (
          <p className="text-center text-slate-500 py-6">Nenhum cliente encontrado.</p>
        ) : (
          <table className="w-full bg-white border-collapse rounded-lg overflow-hidden shadow">
            <thead className="bg-slate-100 text-slate-700 uppercase text-sm">
              <tr>
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Última Compra</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-medium">{cliente.nome}</td>
                  <td className="py-3 px-4">{cliente.createdAt}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={cliente.status} />
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <a
                      href={`/clientes/detalhes/${cliente.id}`}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Ver detalhes"
                    >
                      <FaInfoCircle size={18} />
                    </a>
                    <button
                      onClick={() => handleDelete(cliente)}
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
        )}
      </main>
    </div>
  );
}
