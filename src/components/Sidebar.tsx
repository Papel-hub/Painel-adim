// components/Sidebar.tsx
"use client";

import React from "react";
import { FaHome, FaUsers, FaBox, FaDollarSign, FaBell, FaFileAlt, FaShieldAlt, FaSignOutAlt } from "react-icons/fa";

// ✅ Defina as props
interface SidebarProps {
  onLogout: () => void; // função que não retorna nada
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-lg z-50">
      {/* Logo */}
      <div className="logo p-6 border-b border-slate-700">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FaHome /> Painel Admin
        </h2>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <a
          href="/dashboard"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaHome size={20} />
          <span>Inicio</span>
        </a>

        <a
          href="/clientes"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaUsers size={20} />
          <span>Clientes</span>
        </a>

        <a
          href="/produtos"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaBox size={20} />
          <span>Produtos</span>
        </a>

        <a
          href="/vendas"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaDollarSign size={20} />
          <span>Vendas</span>
        </a>

        <a
          href="/notificacoes"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaBell size={20} />
          <span>Notificações</span>
        </a>

        <a
          href="/paginas"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaFileAlt size={20} />
          <span>Páginas</span>
        </a>

        <a
          href="/administradores"
          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition"
        >
          <FaShieldAlt size={20} />
          <span>Administradores</span>
        </a>
      </nav>

      {/* Botão de Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          <FaSignOutAlt size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}