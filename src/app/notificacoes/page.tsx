"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { FaBell, FaTrash } from "react-icons/fa";

interface Notificacao {
  id: string;
  message: string;
  createdAt: Date | null;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Carregar notificações em tempo real
  useEffect(() => {
    setLoading(true);
    const notificationsRef = collection(db, "notifications");

    const unsubscribe = onSnapshot(
      notificationsRef,
      (snapshot) => {
        const lista: Notificacao[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let createdAt: Date | null = null;

          if (data.createdAt) {
            if (data.createdAt.toDate && typeof data.createdAt.toDate === "function") {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000);
            } else {
              createdAt = new Date(data.createdAt);
            }
          }

          return {
            id: docSnap.id,
            message: data.message || "Sem mensagem",
            createdAt,
          };
        });

        // Ordenar do mais novo para o mais antigo
        lista.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        setNotificacoes(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao escutar notificações:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const excluirNotificacao = async (id: string) => {
    if (!confirm(`Tem certeza que deseja excluir esta notificação?`)) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      alert("✅ Notificação excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir notificação:", error);
      alert(`❌ Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <MainWrapper>
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaBell className="text-orange-600" />
          Notificações
        </h1>
        <ConnectionStatus />
      </header>

      {/* Lista de notificações */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-3">
            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-600">Carregando notificações...</span>
          </div>
        ) : notificacoes.length === 0 ? (
          <p className="text-center text-slate-500 py-10">Nenhuma notificação encontrada.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {notificacoes.map((notif) => (
              <div
                key={notif.id}
                className="p-4 hover:bg-slate-50 flex items-start gap-3"
              >
                <div className="text-orange-600 mt-1 flex-shrink-0">
                  <FaBell />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800">{notif.message}</p>
                  <small className="text-slate-500">
                    {notif.createdAt?.toLocaleString("pt-BR") ?? "Data não disponível"}
                  </small>
                </div>
                <button
                  onClick={() => excluirNotificacao(notif.id)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                  title="Excluir notificação"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500 mt-4 text-center">
        Esta página mostra notificações em tempo real. Novas notificações serão exibidas automaticamente.
      </p>
    </MainWrapper>
  );
}
