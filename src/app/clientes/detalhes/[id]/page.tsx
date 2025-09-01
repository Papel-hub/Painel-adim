"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaCreditCard, FaArrowLeft } from "react-icons/fa";

// Interfaces
interface Compra {
  produto: string;
  qtd: number | string;
  valor: number;
  data: string;
}

interface Pagamento {
  metodo?: string;
  sstatus?: string;
  total?: number;
}

interface Cliente {
  nome: string;
  email?: string;
  celular?: string;
  cpf?: string;
  createdAt?: string;
  status?: string;
  tipoPessoa?: string;
  compras?: Compra[];
  pagamento?: Pagamento;
}

export default function DetalhesCliente() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  // Logout
  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      window.location.href = "/login";
    }
  };

  // Wrapper para evitar repetição
  const MainWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );

  // Carregar cliente
  useEffect(() => {
    const carregarCliente = async () => {
      if (!id) {
        alert("Cliente não encontrado.");
        router.push("/clientes");
        return;
      }
      try {
        const docRef = doc(db, "clientes", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Cliente não encontrado no banco de dados.");
          router.push("/clientes");
          return;
        }

        const data = docSnap.data() as any;

        // Mapear histórico de compras para o formato esperado
        const compras: Compra[] = data.historicoCompras?.map((pedido: any) => ({
          produto: pedido.items[0]?.title || "—",
          qtd: pedido.items[0]?.quantity || 0,
          valor: pedido.items[0]?.price || 0,
          data: pedido.createdAt || "—",
        })) || [];

        // Último pedido para informações de pagamento
        const ultimoPedido = data.historicoCompras?.[data.historicoCompras.length - 1];
        const ultimoItem = ultimoPedido?.items?.[0];

        const pagamento: Pagamento = {
          metodo: ultimoItem?.paymentMethod || "—",
          sstatus: ultimoPedido?.status || "—",
          total: ultimoItem?.price || 0,
        };

        setCliente({
          nome: data.nome || "—",
          email: data.email || "—",
          celular: data.celular || "—",
          cpf: data.cpf || "—",
          createdAt: data.createdAt || "—",
          status: data.status || "—",
          tipoPessoa: data.tipoPessoa || "—",
          compras,
          pagamento,
        });
      } catch (error) {
        console.error("Erro ao carregar cliente:", error);
        alert("Erro ao carregar os detalhes do cliente.");
        router.push("/clientes");
      } finally {
        setLoading(false);
      }
    };
    carregarCliente();
  }, [id, router]);

  if (loading)
    return (
      <MainWrapper>
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-slate-600">Carregando cliente...</span>
        </div>
      </MainWrapper>
    );

  if (!cliente)
    return (
      <MainWrapper>
        <p className="text-center text-red-500 py-10">❌ Cliente não encontrado.</p>
      </MainWrapper>
    );

  const totalPago = cliente.pagamento?.total
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cliente.pagamento.total)
    : "R$ 0,00";

  return (
    <MainWrapper>
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaUser className="text-blue-600" />
          Detalhes do Cliente
        </h1>
        <ConnectionStatus />
      </header>

      {/* Card de Detalhes */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">{cliente.nome}</h2>

        <div className="space-y-5 text-slate-700">
          <p className="flex items-start gap-3">
            <FaUser className="text-blue-500 mt-1 flex-shrink-0" /> <strong>Pessoa:</strong> {cliente.tipoPessoa || "—"}
          </p>
          <p className="flex items-start gap-3">
            <FaEnvelope className="text-blue-500 mt-1 flex-shrink-0" /> <strong>Email:</strong> {cliente.email || "—"}
          </p>
          <p className="flex items-start gap-3">
            <FaPhone className="text-green-500 mt-1 flex-shrink-0" /> <strong>Telefone:</strong> {cliente.celular || "—"}
          </p>
          <p className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" /> <strong>CPF:</strong> {cliente.cpf || "—"}
          </p>
          <p className="flex items-start gap-3">
            <FaBox className="text-purple-500 mt-1 flex-shrink-0" /> <strong>Criado em:</strong> {cliente.createdAt || "—"}
          </p>
          <p className="flex items-start gap-3">
            <FaBox className="text-orange-500 mt-1 flex-shrink-0" /> <strong>Status:</strong>{" "}
            <span className={`ml-1 px-2 py-1 rounded-full font-medium text-sm ${cliente.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {cliente.status ? "Comprou" : "Suspenso"}
            </span>
          </p>
        </div>

        <hr className="my-6 border-slate-200" />

        {/* Histórico de Compras */}
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FaBox /> Histórico de Compras
        </h3>
        {cliente.compras && cliente.compras.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase text-sm">
                <tr>
                  <th className="py-2 px-3 text-left">Produto</th>
                  <th className="py-2 px-3 text-left">Quantidade</th>
                  <th className="py-2 px-3 text-left">Valor</th>
                  <th className="py-2 px-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {cliente.compras.map((compra, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-3">{compra.produto}</td>
                    <td className="py-2 px-3">{compra.qtd}</td>
                    <td className="py-2 px-3">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(compra.valor)}
                    </td>
                    <td className="py-2 px-3">{compra.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 italic">Nenhuma compra registrada.</p>
        )}

        <hr className="my-6 border-slate-200" />

        {/* Informações de Pagamento */}
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FaCreditCard /> Informações de Pagamento
        </h3>
        <div className="space-y-3 text-slate-700">
          <p><strong>Forma de Pagamento:</strong> {cliente.pagamento?.metodo || "—"}</p>
          <p><strong>Status:</strong> {cliente.pagamento?.sstatus || "—"}</p>
          <p className="font-semibold text-lg"><strong>Valor Total Gasto:</strong> {totalPago}</p>
        </div>

        {/* Botão Voltar */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/clientes")}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded transition"
          >
            <FaArrowLeft size={14} /> Voltar
          </button>
        </div>
      </div>
    </MainWrapper>
  );
}
