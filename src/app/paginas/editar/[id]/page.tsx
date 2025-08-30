"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import { FaEdit, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa";

// Loader reutilizável
const Loader = ({ message }: { message?: string }) => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-3 text-slate-600">{message || "Carregando..."}</span>
  </div>
);

// Wrapper para manter sidebar + main consistente
const MainWrapper = ({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar onLogout={onLogout} />
    <main className="ml-64 flex-1 p-8">{children}</main>
  </div>
);

export default function EditarPagina() {
  const { id } = useParams();
  const router = useRouter();
  const [jsonContent, setJsonContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Logout
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/login";
    }
  };

  // Carregar página
  useEffect(() => {
    const carregarPagina = async () => {
      if (!id || typeof id !== "string") return router.push("/paginas");

      try {
        const docRef = doc(db, "pages", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Página não encontrada.");
          return router.push("/paginas");
        }

        const data = docSnap.data();
        setJsonContent(JSON.stringify(data, null, 2));
      } catch (error: any) {
        console.error("Erro ao carregar página:", error);
        alert("Erro ao carregar a página.");
      } finally {
        setLoading(false);
      }
    };

    carregarPagina();
  }, [id, router]);

  // Salvar alterações
  const handleSave = async () => {
    let parsedData;
    try {
      parsedData = JSON.parse(jsonContent);
    } catch (e: any) {
      alert(`JSON inválido: ${e.message}`);
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, "pages", id as string);
      await updateDoc(docRef, {
        ...parsedData,
        updatedAt: new Date(),
      });
      alert("✅ Página atualizada com sucesso!");
      router.push("/paginas");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    if (confirm("Descartar alterações?")) {
      router.push("/paginas");
    }
  };

  if (loading) {
    return <MainWrapper onLogout={handleLogout}><Loader message="Carregando página..." /></MainWrapper>;
  }

  return (
    <MainWrapper onLogout={handleLogout}>
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaEdit className="text-yellow-600" />
          Editar Página
        </h1>
      </header>

      {/* Conteúdo */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <p className="text-slate-700 mb-4">
          <strong>ID da Página:</strong>{" "}
          <span className="font-mono bg-slate-100 px-2 py-1 rounded">{id}</span>
        </p>

        <label htmlFor="pageContent" className="block text-slate-700 font-medium mb-2">
          Conteúdo da Página (JSON)
        </label>
        <textarea
          id="pageContent"
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          className="w-full h-96 p-4 border border-slate-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder='{"titulo": "Sobre", "conteudo": "<p>Texto aqui</p>"}'
          spellCheck={false}
          disabled={isSaving}
        />

        {/* Ações */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-5 py-2 rounded transition"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <FaSave /> Salvar Alterações
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white px-5 py-2 rounded transition"
          >
            <FaTimes /> Cancelar
          </button>

          <button
            onClick={() => router.push("/paginas")}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded transition"
          >
            <FaArrowLeft /> Voltar para Lista
          </button>
        </div>
      </div>
    </MainWrapper>
  );
}
