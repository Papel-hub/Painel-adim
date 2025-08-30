"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";

// Tipagem do produto
interface Produto {
  nome: string;
  qtd: number;
  preco: number;
}

// Tipagem da venda
interface Venda {
  id: string;
  clienteNome: string;
  produtos: Produto[];
  total: number;
  data: Date;
  pagamentoStatus: string;
}

export default function DetalhesVenda() {
  const { id } = useParams();
  const router = useRouter();
  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenda = async () => {
      // Força id ser string caso venha como array
      const docId = Array.isArray(id) ? id[0] : id;
      if (!docId) return;

      try {
        const docRef = doc(db, "vendas", docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Venda não encontrada.");
          router.push("/vendas");
          return;
        }

        const data = docSnap.data() as DocumentData;

        // Converte Firestore Timestamp para Date
        const vendaData: Venda = {
          id: docSnap.id,
          clienteNome: (data.clienteNome as string) || "—",
          produtos: Array.isArray(data.produtos)
            ? (data.produtos as Produto[])
            : [],
          total: Number(data.total) || 0,
          data: data.data instanceof Timestamp ? data.data.toDate() : new Date(data.data),
          pagamentoStatus: (data.pagamentoStatus as string) || "—",
        };

        setVenda(vendaData);
      } catch (error) {
        console.error("Erro ao carregar venda:", error);
        alert("Erro ao carregar detalhes.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenda();
  }, [id, router]);

  if (loading) return <div className="ml-64 p-8">Carregando...</div>;
  if (!venda) return <div className="ml-64 p-8">Venda não encontrada.</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={() => (window.location.href = "/login")} />
      <main className="ml-64 p-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Detalhes da Venda</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-2">
          <p><strong>Cliente:</strong> {venda.clienteNome}</p>
          <p><strong>Total:</strong> R$ {venda.total.toFixed(2)}</p>
          <p>
            <strong>Data:</strong>{" "}
            {venda.data.toLocaleString("pt-BR")}
          </p>
          <p><strong>Status:</strong> {venda.pagamentoStatus}</p>

          <h3 className="font-semibold mt-4">Produtos:</h3>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            {venda.produtos.map((p, i) => (
              <li key={i}>
                {p.nome} — {p.qtd}x R$ {(Number(p.preco) || 0).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
