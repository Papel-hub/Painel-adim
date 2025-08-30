"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaTimes,
  FaSave,
} from "react-icons/fa";

// --- Interfaces ---
interface Produto {
  id: string;
  titulo: string;
  subtitulo: string;
  precoOriginal: number;
  preco: number;
  descricao: string;
  imagemUrl: string;
  arquivoUrl: string; // link para arquivo
  categoria: "consultoria" | "marketing" | "digital";
  bestseller: boolean;
  createdAt: Date | null;
}

// --- Configuração Cloudinary ---
const CLOUD_NAME = "dtxjxffzg";
const UPLOAD_PRESET = "unsigned_files";

// --- Loader Reutilizável ---
const Loader = ({ message }: { message?: string }) => (
  <div className="flex justify-center items-center py-10">
    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-2 text-slate-600">{message || "Carregando..."}</span>
  </div>
);

// --- Wrapper de Layout ---
const MainWrapper = ({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) => (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <Sidebar onLogout={onLogout} />
    <main className="ml-64 flex-1 p-8">{children}</main>
  </div>
);

export default function GerenciarProdutos() {
  // --- Estados ---
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [precoOriginal, setPrecoOriginal] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [categoria, setCategoria] =
    useState<"consultoria" | "marketing" | "digital">("consultoria");
  const [bestseller, setBestseller] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduto, setEditProduto] = useState<Produto | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Logout ---
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/login";
    }
  };

  // --- Carregar produtos ---
  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "produtos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          precoOriginal: data.precoOriginal,
          preco: data.preco,
          descricao: data.descricao,
          imagemUrl: data.imagemUrl || "",
          arquivoUrl: data.arquivoUrl || "",
          categoria: data.categoria,
          bestseller: data.bestseller || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      });
      setProdutos(lista);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // --- Upload Cloudinary ---
  const uploadArquivo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "produtos");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data.secure_url) throw new Error("Erro no upload: " + JSON.stringify(data));
    return data.secure_url;
  };

  // --- Adicionar Produto ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !preco) return alert("Preencha título e preço.");
    setSubmitting(true);

    try {
      let arquivoUrl = "";
      if (documentoFile) arquivoUrl = await uploadArquivo(documentoFile);

      await addDoc(collection(db, "produtos"), {
        titulo,
        subtitulo,
        precoOriginal: parseFloat(precoOriginal) || 0,
        preco: parseFloat(preco),
        descricao,
        imagemUrl,
        arquivoUrl,
        categoria,
        bestseller,
        createdAt: serverTimestamp(),
      });

      alert("✅ Produto cadastrado com sucesso!");
      resetForm();
      carregarProdutos();
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      alert("❌ Erro ao cadastrar produto: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setSubtitulo("");
    setPrecoOriginal("");
    setPreco("");
    setDescricao("");
    setImagemUrl("");
    setDocumentoFile(null);
    setCategoria("consultoria");
    setBestseller(false);
  };

  // --- Excluir Produto ---
  const excluirProduto = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteDoc(doc(db, "produtos", id));
      alert("✅ Produto excluído!");
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("❌ Erro ao excluir produto.");
    }
  };

  // --- Modal de Edição ---
  const abrirModalEdicao = (produto: Produto) => {
    setEditProduto({ ...produto });
    setEditModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduto) return;
    setSavingEdit(true);

    try {
      await updateDoc(doc(db, "produtos", editProduto.id), {
        titulo: editProduto.titulo,
        subtitulo: editProduto.subtitulo,
        precoOriginal: editProduto.precoOriginal,
        preco: editProduto.preco,
        descricao: editProduto.descricao,
        imagemUrl: editProduto.imagemUrl,
        arquivoUrl: editProduto.arquivoUrl,
        categoria: editProduto.categoria,
        bestseller: editProduto.bestseller,
      });
      alert("✅ Produto atualizado!");
      setEditModalOpen(false);
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("❌ Erro ao atualizar produto.");
    } finally {
      setSavingEdit(false);
    }
  };

  const fecharModal = () => {
    setEditModalOpen(false);
    setEditProduto(null);
  };

  // --- Download Arquivo ---
  const baixarArquivo = (produto: Produto) => {
    if (!produto.arquivoUrl) return;
    const url = produto.arquivoUrl.split("?")[0];
    const ext = url.split(".").pop() || "file";

    const link = document.createElement("a");
    link.href = produto.arquivoUrl;
    link.setAttribute("download", `${produto.titulo}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainWrapper onLogout={handleLogout}>
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaBox className="text-green-600" />
          Gerenciar Produtos
        </h1>
        <ConnectionStatus />
      </header>

      {/* Formulário de Adicionar */}
      <section className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Adicionar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" required />
            <input type="text" placeholder="Subtítulo" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} className="p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" step="0.01" placeholder="Preço original" value={precoOriginal} onChange={e => setPrecoOriginal(e.target.value)} className="p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />
            <input type="number" step="0.01" placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value)} className="p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" required />
          </div>

          <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" rows={3} />

          <input type="text" placeholder="URL da Imagem" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />

          <input type="file" onChange={e => setDocumentoFile(e.target.files?.[0] || null)} className="w-full p-2 border border-slate-300 rounded" />

          <select value={categoria} onChange={e => setCategoria(e.target.value as any)} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500">
            <option value="consultoria">Consultoria Farmacêutica</option>
            <option value="marketing">Marketing</option>
            <option value="digital">Digital</option>
          </select>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bestseller} onChange={e => setBestseller(e.target.checked)} />
            Marcar como Mais Vendido
          </label>

          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-3 rounded flex items-center gap-2 transition">
            {submitting ? <> <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando... </> : <><FaPlus /> Adicionar Produto</>}
          </button>
        </form>
      </section>

      {/* Lista de Produtos */}
      <section>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Produtos Cadastrados</h2>
        {loading ? <Loader /> : produtos.length === 0 ? <p className="text-center text-slate-500 py-4">Nenhum produto cadastrado.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map(produto => (
              <div key={produto.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                {produto.imagemUrl && <img src={produto.imagemUrl} alt={produto.titulo} className="w-full h-32 object-cover rounded mb-3" />}
                <h3 className="font-bold text-slate-800">{produto.titulo}</h3>
                <p className="text-slate-600 text-sm">{produto.subtitulo}</p>
                <p className="text-slate-500 line-through">R$ {produto.precoOriginal.toFixed(2)}</p>
                <p className="text-lg font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">{produto.categoria} {produto.bestseller && "🔥 Mais Vendido"}</p>

                {produto.arquivoUrl && (
                  <button onClick={() => baixarArquivo(produto)} className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2"><FaFilePdf /> Baixar arquivo</button>
                )}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => abrirModalEdicao(produto)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center gap-1 text-sm transition"><FaEdit size={14} /> Editar</button>
                  <button onClick={() => excluirProduto(produto.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center gap-1 text-sm transition"><FaTrash size={14} /> Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Edição */}
      {editModalOpen && editProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaEdit /> Editar Produto</h2>
            <form onSubmit={salvarEdicao} className="space-y-4">
              <input type="text" placeholder="Título" value={editProduto.titulo} onChange={e => setEditProduto({...editProduto, titulo:e.target.value})} className="w-full p-3 border border-slate-300 rounded" required />
              <input type="text" placeholder="Subtítulo" value={editProduto.subtitulo} onChange={e => setEditProduto({...editProduto, subtitulo:e.target.value})} className="w-full p-3 border border-slate-300 rounded" />
              <input type="number" step="0.01" placeholder="Preço Original" value={editProduto.precoOriginal} onChange={e => setEditProduto({...editProduto, precoOriginal:parseFloat(e.target.value) || 0})} className="w-full p-3 border border-slate-300 rounded" />
              <input type="number" step="0.01" placeholder="Preço" value={editProduto.preco} onChange={e => setEditProduto({...editProduto, preco:parseFloat(e.target.value) || 0})} className="w-full p-3 border border-slate-300 rounded" required />
              <textarea placeholder="Descrição" value={editProduto.descricao} onChange={e => setEditProduto({...editProduto, descricao:e.target.value})} className="w-full p-3 border border-slate-300 rounded" rows={3} />
              <input type="text" placeholder="URL da Imagem" value={editProduto.imagemUrl} onChange={e => setEditProduto({...editProduto, imagemUrl:e.target.value})} className="w-full p-3 border border-slate-300 rounded" />
              {editProduto.imagemUrl && <img src={editProduto.imagemUrl} alt="Pré-visualização" className="h-24 mt-2 rounded" />}
              <input type="file" onChange={async e => {
                const file = e.target.files?.[0]; 
                if(file){
                  const url = await uploadArquivo(file);
                  setEditProduto({...editProduto, arquivoUrl:url});
                }
              }} className="w-full p-2 border border-slate-300 rounded" />
              {editProduto.arquivoUrl && <a href={editProduto.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Ver arquivo atual</a>}
              <select value={editProduto.categoria} onChange={e => setEditProduto({...editProduto, categoria:e.target.value as any})} className="w-full p-3 border border-slate-300 rounded">
                <option value="consultoria">Consultoria Farmacêutica</option>
                <option value="marketing">Marketing</option>
                <option value="digital">Digital</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editProduto.bestseller} onChange={e => setEditProduto({...editProduto, bestseller:e.target.checked})} />
                Marcar como Mais Vendido
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center gap-2">
                  {savingEdit ? <> <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando... </> : <><FaSave /> Salvar</>}
                </button>
                <button type="button" onClick={fecharModal} className="flex-1 bg-slate-500 hover:bg-slate-600 text-white p-2 rounded flex items-center justify-center gap-2"><FaTimes /> Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainWrapper>
  );
}
