import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

export default function Tontines() {
  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTontines() {
      try {
        const response = await fetch(`${API_BASE}/tontines`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du chargement des tontines.");
        }

        setTontines(data);
      } catch (err) {
        setError(err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    loadTontines();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="glass-card">
          <h1>Mes tontines</h1>

          {loading && <p>Chargement...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && tontines.length === 0 && (
            <p>Aucune tontine enregistrée pour le moment.</p>
          )}

          {!loading && !error && tontines.length > 0 && (
            <div className="tontines-list">
              {tontines.map((tontine) => (
                <div key={tontine.id} className="glass-card" style={{ marginTop: "16px" }}>
                  <h3>{tontine.name}</h3>
                  <p>Montant : {tontine.amount} FCFA</p>
                  <p>Fréquence : {tontine.frequency}</p>
                  <p>Membres : {tontine.members_count}</p>
                  <p>Total collecté : {tontine.total_collected} FCFA</p>
                  {tontine.description && <p>Description : {tontine.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}