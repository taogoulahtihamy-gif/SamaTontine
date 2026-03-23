import Navbar from "../components/Navbar";

function Create() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <main className="main-grid mobile-main">
        <section id="create" className="panel glass-card create-panel">
          <div className="section-title">
            <p className="eyebrow">Création</p>
            <h2>Créer une nouvelle tontine</h2>
            <p>Cette page accueillera le formulaire complet de création.</p>
          </div>

          <div className="glass-subcard">
            <p className="muted">Formulaire à déplacer ici dans l’étape suivante.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Create;