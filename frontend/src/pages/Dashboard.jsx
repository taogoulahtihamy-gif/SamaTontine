import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

export default function Dashboard() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE}/tontines/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Erreur lors du chargement du dashboard.");
        }

        setData(result);
      } catch (err) {
        setError(err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [id]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <main className="page-shell">
        {loading && <p className="state-text">Chargement du dashboard...</p>}
        {error && <p className="state-text error-text">{error}</p>}

        {!loading && !error && data && (
          <>
            <section className="list-hero-card">
              <div>
                <span className="section-chip">Dashboard</span>
                <h1>{data.tontine?.name || "Tontine"}</h1>
                <p>{data.tontine?.description || "Aucune description."}</p>
              </div>

              <Link to="/tontines" className="secondary-action-btn">
                ← Retour aux tontines
              </Link>
            </section>

            <section className="dashboard-grid">
              <article className="dashboard-block glass-card">
                <h3>Informations générales</h3>
                <div className="member-status-list">
                  <div className="status-row">
                    <div className="status-left">
                      <strong>Montant</strong>
                    </div>
                    <div className="status-right">
                      <strong>
                        {Number(data.tontine?.amount || 0).toLocaleString()} FCFA
                      </strong>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-left">
                      <strong>Fréquence</strong>
                    </div>
                    <div className="status-right">
                      <strong>{data.tontine?.frequency || "Non définie"}</strong>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-left">
                      <strong>Date de début</strong>
                    </div>
                    <div className="status-right">
                      <strong>{data.tontine?.start_date || "Non définie"}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <article className="dashboard-block glass-card">
                <h3>Vue rapide</h3>
                <div className="card-stats-grid">
                  <div className="mini-stat">
                    <span>Membres</span>
                    <strong>{data.members?.length || 0}</strong>
                  </div>

                  <div className="mini-stat">
                    <span>Total collecté</span>
                    <strong>
                      {Number(data.totals?.total_collected || 0).toLocaleString()} FCFA
                    </strong>
                  </div>

                  <div className="mini-stat">
                    <span>Nombre de paiements</span>
                    <strong>{Number(data.totals?.payments_count || 0)}</strong>
                  </div>

                  <div className="mini-stat">
                    <span>Prochain bénéficiaire</span>
                    <strong>{data.nextBeneficiary?.full_name || "Non défini"}</strong>
                  </div>
                </div>
              </article>
            </section>

            <section className="dashboard-grid" style={{ marginTop: "18px" }}>
              <article className="dashboard-block glass-card">
                <h3>Membres</h3>

                <div className="member-status-list">
                  {data.members?.length ? (
                    data.members.map((member) => (
                      <div key={member.id} className="status-row">
                        <div className="status-left">
                          <strong>{member.full_name}</strong>
                          <span>{member.phone || "Téléphone non renseigné"}</span>
                        </div>

                        <div className="status-right">
                          <strong>
                            {Number(member.total_paid || 0).toLocaleString()} FCFA
                          </strong>
                          <small>{member.payments_count || 0} paiement(s)</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Aucun membre pour le moment.</p>
                  )}
                </div>
              </article>

              <article className="dashboard-block glass-card">
                <h3>Paiements récents</h3>

                <div className="member-status-list">
                  {data.recentPayments?.length ? (
                    data.recentPayments.map((payment) => (
                      <div key={payment.id} className="history-row">
                        <div className="status-left">
                          <strong>{payment.member_name}</strong>
                          <span>{payment.payment_date}</span>
                        </div>

                        <div className="status-right">
                          <strong>
                            {Number(payment.amount || 0).toLocaleString()} FCFA
                          </strong>
                          <small>{payment.note || "Sans note"}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Aucun paiement enregistré.</p>
                  )}
                </div>
              </article>
            </section>

            <section className="dashboard-grid" style={{ marginTop: "18px" }}>
              <article className="dashboard-block glass-card">
                <h3>Historique des redistributions</h3>

                <div className="member-status-list">
                  {data.payoutHistory?.length ? (
                    data.payoutHistory.map((item) => (
                      <div key={item.id} className="history-row">
                        <div className="status-left">
                          <strong>{item.beneficiary_name}</strong>
                          <span>{item.round_label}</span>
                        </div>

                        <div className="status-right">
                          <strong>
                            {Number(item.amount || 0).toLocaleString()} FCFA
                          </strong>
                          <small>{item.payout_date}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Aucune redistribution enregistrée.</p>
                  )}
                </div>
              </article>

              <article className="dashboard-block glass-card">
                <h3>Prochain bénéficiaire</h3>

                {data.nextBeneficiary ? (
                  <div className="glass-subcard">
                    <strong style={{ fontSize: "1.2rem" }}>
                      {data.nextBeneficiary.full_name}
                    </strong>
                    <p className="muted" style={{ marginTop: "8px" }}>
                      Téléphone : {data.nextBeneficiary.phone || "Non renseigné"}
                    </p>
                    <p className="muted">
                      Email : {data.nextBeneficiary.email || "Non renseigné"}
                    </p>
                    <p className="muted">
                      Position : {data.nextBeneficiary.position || "-"}
                    </p>
                  </div>
                ) : (
                  <p className="muted">Aucun bénéficiaire disponible.</p>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}