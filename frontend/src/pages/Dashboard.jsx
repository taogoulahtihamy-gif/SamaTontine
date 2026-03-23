function Dashboard() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <main className="main-grid mobile-main">
        <section id="dashboard" className="panel glass-card">
          <div className="section-title">
            <p className="eyebrow">Pilotage</p>
            <h2>Tableau de bord</h2>
            <p>Le dashboard détaillé sera déplacé ici dans l’étape suivante.</p>
          </div>

          <div className="glass-subcard">
            <p className="muted">Stats, paiements, bénéficiaire et historique arriveront ici.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;