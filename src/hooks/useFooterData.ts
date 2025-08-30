import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // ajusta o path conforme teu projeto

type FooterData = {
  companyName: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  socials: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
};

export function useFooterData() {
  const [data, setData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFooter() {
      try {
        const ref = doc(db, "pages", "footer");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const d = snap.data();

          const formatted: FooterData = {
            companyName: d.companyName || "",
            description: d.description || "",
            phone: d.phone || "",
            whatsapp: d.whatsapp ? d.whatsapp.trim() : "",
            email: d.email || "",
            socials: d.socials || {},
          };

          console.log("FOOTER FIRESTORE DATA:", formatted);
          setData(formatted);
        } else {
          console.warn("Documento 'footer' não encontrado no Firestore.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do rodapé:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFooter();
  }, []);

  return { data, loading };
}
