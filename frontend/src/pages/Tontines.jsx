import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

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
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <main className="page-shell">
        <section className="list-hero-card">
          <div>
            <span className="section-chip">Organisation</span>
            <h1>Mes tontines</h1>
            <p>
              Suis toutes tes tontines, les membres inscrits et le total déjà collecté.
            </p>
          </div>

          <Link to="/create" className="primary-action-btn">
            + Nouvelle tontine
          </Link>
        </section>

        {loading && <p className="state-text">Chargement des tontines...</p>}
        {error && <p className="state-text error-text">{error}</p>}

        {!loading && !error && tontines.length === 0 && (
          <section className="empty-card">
            <h3>Aucune tontine pour le moment</h3>
            <p>Crée ta première tontine pour commencer.</p>
            <Link to="/create" className="primary-action-btn">
              Créer une tontine
            </Link>
          </section>
        )}

        {!loading && !error && tontines.length > 0 && (
          <section className="tontines-grid">
            {tontines.map((tontine) => (
              <article key={tontine.id} className="tontine-premium-card">
                <div className="card-head">
                  <div className="card-title-wrap">
                    <h3>{tontine.name}</h3>
                    <p>{tontine.description || "Aucune description ajoutée."}</p>
                  </div>

                  <span className="frequency-badge">
                    {tontine.frequency || "Non définie"}
                  </span>
                </div>

                <div className="card-stats-grid">
                  <div className="mini-stat">
                    <span>Montant</span>
                    <strong>
                      {Number(tontine.amount || 0).toLocaleString()} FCFA
                    </strong>
                  </div>

                  <div className="mini-stat">
                    <span>Membres</span>
                    <strong>{Number(tontine.members_count || 0)}</strong>
                  </div>

                  <div className="mini-stat">
                    <span>Total collecté</span>
                    <strong>
                      {Number(tontine.total_collected || 0).toLocaleString()} FCFA
                    </strong>
                  </div>

                  <div className="mini-stat">
                    <span>Date de début</span>
                    <strong>{tontine.start_date || "Non définie"}</strong>
                  </div>
                </div>

                <div className="card-footer">
                  <Link to={`/dashboard/${tontine.id}`} className="secondary-action-btn">
                    Ouvrir
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}