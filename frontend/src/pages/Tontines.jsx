import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

export default function Tontines() {
  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const isAdmin = useMemo(() => {
    return !!localStorage.getItem("adminToken");
  }, []);

  useEffect(() => {
    async function loadTontines() {
      try {
        setLoading(true);
        setError("");

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

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleDeleteTontine(tontineId, tontineName) {
    const ok = window.confirm(`Supprimer la tontine "${tontineName}" ?`);
    if (!ok) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Connexion admin requise.");
      }

      const response = await fetch(`${API_BASE}/tontines/${tontineId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la suppression.");
      }

      setTontines((prev) => prev.filter((t) => t.id !== tontineId));
      showToast("Tontine supprimée avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-1" />
        <div className="ambient ambient-2" />
        <Navbar />
        <main className="page-shell">
          <p className="state-text">Chargement des tontines...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-1" />
        <div className="ambient ambient-2" />
        <Navbar />
        <main className="page-shell">
          <p className="state-text error-text">{error}</p>
        </main>
      </div>
    );
  }

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

          {isAdmin ? (
            <Link to="/create" className="primary-action-btn">
              + Nouvelle tontine
            </Link>
          ) : (
            <Link to="/login-admin" className="primary-action-btn">
              Connexion admin
            </Link>
          )}
        </section>

        {tontines.length === 0 ? (
          <section className="empty-card">
            <h3>Aucune tontine pour le moment</h3>
            <p>Crée ta première tontine pour commencer.</p>

            {isAdmin ? (
              <Link to="/create" className="primary-action-btn">
                Créer une tontine
              </Link>
            ) : (
              <Link to="/login-admin" className="primary-action-btn">
                Connexion admin
              </Link>
            )}
          </section>
        ) : (
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

                <div className="card-footer card-footer-split">
                  {isAdmin ? (
                    <Link
                      to={`/dashboard/${tontine.id}`}
                      className="secondary-action-btn"
                    >
                      Ouvrir
                    </Link>
                  ) : (
                    <Link to="/login-admin" className="secondary-action-btn">
                      Connexion admin
                    </Link>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      className="danger-action-btn"
                      onClick={() => handleDeleteTontine(tontine.id, tontine.name)}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}