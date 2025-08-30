"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// Ícones
import { FaUsers, FaBox, FaHome, FaDollarSign, FaBell } from "react-icons/fa";

// Componente reutilizável de Card do Dashboard
type DashboardCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
};

const DashboardCard = ({ title, count, icon, bgColor }: DashboardCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <span className="text-2xl font-bold text-slate-800">{count}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [counts, setCounts] = useState({
    clientesCount: 0,
    produtosCount: 0,
    vendasCount: 0,
    notificacoesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  // Obter usuário logado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || "Administrador");
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  // Buscar dados do Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesSnap, produtosSnap, vendasSnap, notificacoesSnap] = await Promise.all([
          getDocs(collection(db, "clientes")),
          getDocs(collection(db, "produtos")),
          getDocs(collection(db, "vendas")),
          getDocs(collection(db, "notifications")),
        ]);

        setCounts({
          clientesCount: clientesSnap.size,
          produtosCount: produtosSnap.size,
          vendasCount: vendasSnap.size,
          notificacoesCount: notificacoesSnap.size,
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função de logout
  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      const auth = getAuth();
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Conteúdo Principal */}
      <main className="ml-64 flex-1 p-8">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaHome className="text-blue-600" />
            Dashboard
          </h1>
          <ConnectionStatus />
        </header>

        {/* Mensagem de boas-vindas */}
        <p className="text-lg text-slate-700 mb-8">
          Bem-vindo, <strong>{userName || "usuário"}</strong>, ao painel administrativo da{" "}
          <strong>Talento Store</strong>.
        </p>

        {/* Cards */}
        {loading ? (
          <div role="status" className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600">Carregando dados...</span>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Clientes"
              count={counts.clientesCount}
              icon={<FaUsers size={28} className="text-blue-600" />}
              bgColor="bg-blue-100"
            />
            <DashboardCard
              title="Produtos"
              count={counts.produtosCount}
              icon={<FaBox size={28} className="text-green-600" />}
              bgColor="bg-green-100"
            />
            <DashboardCard
              title="Vendas"
              count={counts.vendasCount}
              icon={<FaDollarSign size={28} className="text-purple-600" />}
              bgColor="bg-purple-100"
            />
            <DashboardCard
              title="Notificações"
              count={counts.notificacoesCount}
              icon={<FaBell size={28} className="text-orange-600" />}
              bgColor="bg-orange-100"
            />
          </section>
        )}
      </main>
    </div>
  );
}
