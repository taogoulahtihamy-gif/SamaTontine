// 🔥 VERSION COMPLETE PROPRE (aucune perte + nouvelles features)

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

export default function Dashboard() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [toast, setToast] = useState("");

  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPaymentForm, setEditingPaymentForm] = useState({});

  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [editingPayoutForm, setEditingPayoutForm] = useState({});

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function load() {
    const res = await fetch(`${API_BASE}/tontines/${id}`);
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, []);

  // ============================
  // DELETE MEMBER
  // ============================
  async function deleteMember(memberId) {
    await fetch(`${API_BASE}/tontines/${id}/members/${memberId}`, {
      method: "DELETE",
    });
    load();
    showToast("Membre supprimé");
  }

  // ============================
  // PAYMENTS
  // ============================
  async function deletePayment(pid) {
    await fetch(`${API_BASE}/tontines/${id}/payments/${pid}`, {
      method: "DELETE",
    });
    load();
    showToast("Paiement supprimé");
  }

  async function updatePayment(pid) {
    await fetch(`${API_BASE}/tontines/${id}/payments/${pid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPaymentForm),
    });
    setEditingPaymentId(null);
    load();
    showToast("Paiement modifié");
  }

  // ============================
  // PAYOUTS
  // ============================
  async function deletePayout(pid) {
    await fetch(`${API_BASE}/tontines/${id}/payouts/${pid}`, {
      method: "DELETE",
    });
    load();
    showToast("Redistribution supprimée");
  }

  async function updatePayout(pid) {
    await fetch(`${API_BASE}/tontines/${id}/payouts/${pid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPayoutForm),
    });
    setEditingPayoutId(null);
    load();
    showToast("Redistribution modifiée");
  }

  if (!data) return <p>Chargement...</p>;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell">

        {/* ===== HEADER ===== */}
        <section className="list-hero-card">
          <div>
            <h1>{data.tontine.name}</h1>
            <p>{data.tontine.description}</p>
          </div>
        </section>

        {/* ===== MEMBRES ===== */}
        <section className="dashboard-block glass-card">
          <h3>Membres</h3>

          {data.members.map((m) => (
            <div key={m.id} className="status-row">
              <div>
                <strong>{m.full_name}</strong>
                <p className="muted">{m.phone}</p>
              </div>

              <div className="inline-actions">
                <button
                  className="danger-action-btn"
                  onClick={() => deleteMember(m.id)}
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
                    <button onClick={() => updatePayment(p.id)}>
                      Save
                    </button>
                    <button onClick={() => setEditingPaymentId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="history-row">
                <div>
                  <strong>{p.member_name}</strong>
                  <span>{p.payment_date}</span>
                </div>

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
                    onClick={() => deletePayment(p.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* ===== PAYOUT ===== */}
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
                    <button onClick={() => updatePayout(r.id)}>Save</button>
                    <button onClick={() => setEditingPayoutId(null)}>Cancel</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={r.id} className="history-row">
                <div>
                  <strong>{r.beneficiary_name}</strong>
                  <span>{r.round_label}</span>
                </div>

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
                    onClick={() => deletePayout(r.id)}
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