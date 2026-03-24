import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

function Home() {
  const [stats, setStats] = useState({
    tontinesCount: 0,
    totalCollected: 0,
    nextBeneficiary: "À définir",
  });

  useEffect(() => {
    async function loadHomeStats() {
      try {
        const response = await fetch(`${API_BASE}/tontines`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          return;
        }

        const tontinesCount = data.length;
        const totalCollected = data.reduce(
          (sum, item) => sum + Number(item.total_collected || 0),
          0
        );

        const nextBeneficiary =
          tontinesCount > 0 ? "Voir dans le dashboard" : "À définir";

        setStats({
          tontinesCount,
          totalCollected,
          nextBeneficiary,
        });
      } catch (error) {
        console.error("Erreur chargement accueil :", error);
      }
    }

    loadHomeStats();
  }, []);

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <header className="hero" id="home">
        <div className="hero-grid">
          <section className="hero-copy glass-card">
            <span className="hero-chip">Simple · Élégant · Traçable</span>
            <h1>Une interface ultra claire pour gérer vos tontines sans stress.</h1>
            <p>
              Crée ton groupe, ajoute les membres, enregistre les paiements,
              suis le prochain bénéficiaire et garde un historique propre.
              Pensé pour être beau, utile et vraiment différenciant.
            </p>

            <div className="hero-actions">
              <Link to="/create" className="primary-btn">
                Créer une tontine
              </Link>
              <Link to="/tontines" className="ghost-btn">
                Voir le tableau de bord
              </Link>
            </div>
          </section>

          <section className="hero-panel glass-card">
            <div className="mini-grid">
              <div className="glass-subcard stat-card">
                <span>Tontines créées</span>
                <strong>{stats.tontinesCount}</strong>
                <small>données réelles</small>
              </div>

              <div className="glass-subcard stat-card">
                <span>Collecte globale</span>
                <strong>{stats.totalCollected.toLocaleString()} FCFA</strong>
                <small>paiements enregistrés</small>
              </div>
            </div>

            <div className="hero-visual">
              <div className="ring ring-a" />
              <div className="ring ring-b" />

              <div className="visual-card glass-subcard">
                <p className="muted">Prochain bénéficiaire</p>
                <strong>{stats.nextBeneficiary}</strong>
                <span>La logique détaillée se trouve dans chaque dashboard</span>
              </div>
            </div>
          </section>
        </div>
      </header>
    </div>
  );
}

export default Home;