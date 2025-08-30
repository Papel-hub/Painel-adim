// hooks/usePrivacyPolicy.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

type PolicyData = {
  title: string;
  content: string;
};

export function usePrivacyPolicy() {
  const [data, setData] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const ref = doc(db, "pages", "privacidade"); // 👈 documento privacy
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const d = snap.data();
          setData({
            title: d.title || "Política de Privacidade",
            content: d.content || "",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar política:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPolicy();
  }, []);

  return { data, loading };
}
