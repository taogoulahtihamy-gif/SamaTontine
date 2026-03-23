import Navbar from "../components/Navbar";

function Tontines() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <main className="main-grid mobile-main">
        <aside className="sidebar glass-card" id="tontines">
          <div className="sidebar-head">
            <h3>Mes tontines</h3>
          </div>

          <div className="list-stack">
            <p className="muted">La liste des tontines sera déplacée ici dans l’étape suivante.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Tontines;