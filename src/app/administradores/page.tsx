"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";

// Toast
import { toast } from "react-hot-toast";

// Ícones
import { FaShieldAlt, FaUserPlus, FaTrash, FaToggleOff, FaToggleOn } from "react-icons/fa";

// Interface
interface Admin {
  id: string;
  email: string;
  role: "editor" | "master";
  status: "ativo" | "suspenso";
  createdAt: Date | null;
}

export default function GestaoAdministradores() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "master">("editor");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      router.push("/login");
    }
  };

  // Carregar administradores
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "admins"));
      const lista: Admin[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          role: data.role,
          status: data.status,
          createdAt: data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : null,
        };
      });
      setAdmins(lista);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar administradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Adicionar admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Insira um e-mail válido.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("E-mail inválido.");

    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        "T@l3nt0St0r3@2025"
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: `Admin ${role.toUpperCase()}` });

      const newAdmin = {
        email: user.email,
        role,
        status: "ativo" as const,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "admins"), newAdmin);

      setAdmins(prev => [
        ...prev,
        { ...newAdmin, id: docRef.id, createdAt: new Date(), email: newAdmin.email! } // ! garante que não é null
      ]);

      toast.success("Administrador adicionado com sucesso!");
      setEmail("");
      setRole("editor");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") toast.error("Este e-mail já está em uso.");
      else if (error.code === "auth/invalid-email") toast.error("E-mail inválido.");
      else toast.error("Erro ao adicionar administrador.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Remover admin
  const handleRemove = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover o administrador ${email}?`)) return;
    try {
      await deleteDoc(doc(db, "admins", id));
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.success("Administrador removido com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover administrador.");
    }
  };

  // Toggle status
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ativo" ? "suspenso" : "ativo";
    try {
      await updateDoc(doc(db, "admins", id), { status: newStatus });
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === id ? { ...admin, status: newStatus } : admin))
      );
      toast.success(`Status alterado para ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="ml-64 flex-1 p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaShieldAlt className="text-purple-600" />
            Gestão de Administradores
          </h1>
          <ConnectionStatus />
        </header>

        {/* Adicionar Admin */}
        <section className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Adicionar Administrador</h2>
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail do novo administrador"
              className="flex-1 p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "master")}
              className="p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="editor">Editor</option>
              <option value="master">Master</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-3 rounded flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaUserPlus size={16} />
              )}
              Adicionar
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-2">
            O usuário será criado no Firebase Auth e receberá acesso ao painel.
          </p>
        </section>

        {/* Lista de Admins */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Lista de Administradores</h2>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-slate-600">Carregando...</span>
            </div>
          ) : admins.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Nenhum administrador cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-700">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-sm">
                    <th className="text-left py-3 px-4">E-mail</th>
                    <th className="text-left py-3 px-4">Cargo</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Data de Criação</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium truncate max-w-[200px]">{admin.email}</td>
                      <td className="py-3 px-4">{admin.role === "master" ? "Master" : "Editor"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            admin.status === "ativo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.status === "ativo" ? "Ativo" : "Suspenso"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{admin.createdAt?.toLocaleString("pt-BR") ?? "—"}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(admin.id, admin.status)}
                          className={`p-1.5 rounded transition ${
                            admin.status === "ativo"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={admin.status === "ativo" ? "Suspender" : "Ativar"}
                        >
                          {admin.status === "ativo" ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleRemove(admin.id, admin.email)}
                          className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition"
                          title="Remover"
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
