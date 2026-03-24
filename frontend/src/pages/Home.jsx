import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <header className="hero" id="home">
        <div className="hero-grid">
          <section className="hero-copy">
            <span className="hero-chip">Simple · Élégant · Traçable</span>
            <h1>Une interface ultra claire pour gérer vos tontines sans stress.</h1>
            <p>
              Crée ton groupe, ajoute les membres, enregistre les paiements, suis le prochain
              bénéficiaire et garde un historique propre. Pensé pour être beau, utile et vraiment
              différenciant.
            </p>

            <div className="hero-actions mobile-hero-actions">
              <button
                className="primary-btn"
                onClick={() => navigate("/create")}
              >
                Créer une tontine
              </button>

              <button
                className="ghost-btn"
                onClick={() => navigate("/dashboard")}
              >
                Voir le tableau de bord
              </button>
            </div>
          </section>

          <section className="hero-panel glass-card">
            <div className="mini-grid">
              <div className="stat-card glass-card">
                <span>Tontines créées</span>
                <strong>0</strong>
                <small>version V2 en cours</small>
              </div>

              <div className="stat-card glass-card">
                <span>Collecte globale</span>
                <strong>0 FCFA</strong>
                <small>pages séparées actives</small>
              </div>
            </div>

            <div className="hero-visual">
              <div className="ring ring-a"></div>
              <div className="ring ring-b"></div>
              <div className="visual-card glass-card">
                <p>Prochain bénéficiaire</p>
                <strong>À définir</strong>
                <span>La logique complète arrive dans le dashboard</span>
              </div>
            </div>
          </section>
        </div>
      </header>
    </div>
  );
}

export default Home;