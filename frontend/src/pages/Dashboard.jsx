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
  const [toast, setToast] = useState("");

  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPaymentForm, setEditingPaymentForm] = useState({});

  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [editingPayoutForm, setEditingPayoutForm] = useState({});

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  async function loadDashboard() {
    const res = await fetch(`${API_BASE}/tontines/${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [id]);

  async function handleDeleteMember(memberId) {
    await fetch(`${API_BASE}/tontines/${id}/members/${memberId}`, {
      method: "DELETE",
    });
    loadDashboard();
    showToast("Membre supprimé");
  }

  async function handleDeletePayment(paymentId) {
    await fetch(`${API_BASE}/tontines/${id}/payments/${paymentId}`, {
      method: "DELETE",
    });
    loadDashboard();
    showToast("Paiement supprimé");
  }

  async function handleUpdatePayment(paymentId) {
    await fetch(`${API_BASE}/tontines/${id}/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPaymentForm),
    });
    setEditingPaymentId(null);
    loadDashboard();
    showToast("Paiement modifié");
  }

  async function handleDeletePayout(payoutId) {
    await fetch(`${API_BASE}/tontines/${id}/payouts/${payoutId}`, {
      method: "DELETE",
    });
    loadDashboard();
    showToast("Redistribution supprimée");
  }

  async function handleUpdatePayout(payoutId) {
    await fetch(`${API_BASE}/tontines/${id}/payouts/${payoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPayoutForm),
    });
    setEditingPayoutId(null);
    loadDashboard();
    showToast("Redistribution modifiée");
  }

  if (loading) return <p>Chargement...</p>;
  if (!data) return <p>Aucune donnée</p>;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell">

        {/* ===== MEMBRES ===== */}
        <section className="dashboard-block glass-card">
          <h3>Membres</h3>

          {data.members.map((m) => (
            <div key={m.id} className="status-row">
              <strong>{m.full_name}</strong>

              <div className="inline-actions">
                <button
                  className="danger-action-btn"
                  onClick={() => handleDeleteMember(m.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ===== PAIEMENTS ===== */}
        <section className="dashboard-block glass-card">
          <h3>Paiements récents</h3>

          {data.recentPayments.map((p) => {
            if (editingPaymentId === p.id) {
              return (
                <div key={p.id} className="glass-subcard">
                  <input
                    value={editingPaymentForm.amount || ""}
                    onChange={(e) =>
                      setEditingPaymentForm({
                        ...editingPaymentForm,
                        amount: e.target.value,
                      })
                    }
                  />

                  <div className="inline-actions">
                    <button
                      className="primary-action-btn"
                      onClick={() => handleUpdatePayment(p.id)}
                    >
                      Enregistrer
                    </button>

                    <button
                      className="secondary-action-btn"
                      onClick={() => setEditingPaymentId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="history-row">
                <strong>{p.member_name}</strong>

                <div className="inline-actions">
                  <button
                    className="secondary-action-btn"
                    onClick={() => {
                      setEditingPaymentId(p.id);
                      setEditingPaymentForm(p);
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    className="danger-action-btn"
                    onClick={() => handleDeletePayment(p.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== REDISTRIBUTIONS ===== */}
        <section className="dashboard-block glass-card">
          <h3>Redistributions</h3>

          {data.payoutHistory.map((r) => {
            if (editingPayoutId === r.id) {
              return (
                <div key={r.id} className="glass-subcard">
                  <input
                    value={editingPayoutForm.amount || ""}
                    onChange={(e) =>
                      setEditingPayoutForm({
                        ...editingPayoutForm,
                        amount: e.target.value,
                      })
                    }
                  />

                  <div className="inline-actions">
                    <button
                      className="primary-action-btn"
                      onClick={() => handleUpdatePayout(r.id)}
                    >
                      Enregistrer
                    </button>

                    <button
                      className="secondary-action-btn"
                      onClick={() => setEditingPayoutId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={r.id} className="history-row">
                <strong>{r.beneficiary_name}</strong>

                <div className="inline-actions">
                  <button
                    className="secondary-action-btn"
                    onClick={() => {
                      setEditingPayoutId(r.id);
                      setEditingPayoutForm(r);
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    className="danger-action-btn"
                    onClick={() => handleDeletePayout(r.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}