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

  const [memberForm, setMemberForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    memberId: "",
    amount: "",
    paymentDate: "",
    note: "",
  });

  const [payoutForm, setPayoutForm] = useState({
    beneficiaryMemberId: "",
    roundLabel: "",
    amount: "",
    payoutDate: "",
    status: "paid",
  });

  const [editingTontine, setEditingTontine] = useState(false);
  const [tontineForm, setTontineForm] = useState({
    name: "",
    amount: "",
    frequency: "",
    startDate: "",
    description: "",
  });

  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingMemberForm, setEditingMemberForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPaymentForm, setEditingPaymentForm] = useState({
    memberId: "",
    amount: "",
    paymentDate: "",
    note: "",
  });

  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [editingPayoutForm, setEditingPayoutForm] = useState({
    beneficiaryMemberId: "",
    roundLabel: "",
    amount: "",
    payoutDate: "",
    status: "paid",
  });

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function getMemberStatus(member, tontineAmount) {
    const paid = Number(member?.total_paid || 0);
    const expected = Number(tontineAmount || 0);

    if (expected > 0 && paid >= expected) {
      return { label: "À jour", className: "paid" };
    }

    if (paid > 0) {
      return { label: "Partiel", className: "partial" };
    }

    return { label: "En attente", className: "pending" };
  }

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/tontines/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors du chargement du dashboard.");
      }

      setData(result);
      setTontineForm({
        name: result.tontine?.name || "",
        amount: result.tontine?.amount || "",
        frequency: result.tontine?.frequency || "",
        startDate: result.tontine?.start_date || "",
        description: result.tontine?.description || "",
      });
    } catch (err) {
      setError(err.message || "Erreur réseau");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadDashboard();
    }
  }, [id]);

  async function handleUpdateTontine(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/tontines/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tontineForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la modification de la tontine.");
      }

      setData(result);
      setEditingTontine(false);
      showToast("Tontine modifiée avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  function startEditMember(member) {
    setEditingMemberId(member.id);
    setEditingMemberForm({
      fullName: member.full_name || "",
      phone: member.phone || "",
      email: member.email || "",
    });
  }

  function cancelEditMember() {
    setEditingMemberId(null);
    setEditingMemberForm({
      fullName: "",
      phone: "",
      email: "",
    });
  }

  async function handleUpdateMember(memberId) {
    try {
      const response = await fetch(
        `${API_BASE}/tontines/${id}/members/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingMemberForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la modification du membre.");
      }

      setData(result);
      cancelEditMember();
      showToast("Membre modifié avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/tontines/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l’ajout du membre.");
      }

      setMemberForm({
        fullName: "",
        phone: "",
        email: "",
      });

      setData(result);
      showToast("Membre ajouté avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleDeleteMember(memberId, fullName) {
    const ok = window.confirm(`Supprimer le membre "${fullName}" ?`);
    if (!ok) return;

    try {
      const response = await fetch(`${API_BASE}/tontines/${id}/members/${memberId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la suppression du membre.");
      }

      setData(result);
      showToast("Membre supprimé avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleAddPayment(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/tontines/${id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l’enregistrement du paiement.");
      }

      setPaymentForm({
        memberId: "",
        amount: "",
        paymentDate: "",
        note: "",
      });

      setData(result);
      showToast("Paiement enregistré avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  function startEditPayment(payment) {
    const linkedMember = data.members?.find(
      (member) => member.full_name === payment.member_name
    );

    setEditingPaymentId(payment.id);
    setEditingPaymentForm({
      memberId: linkedMember ? String(linkedMember.id) : "",
      amount: payment.amount ? String(payment.amount) : "",
      paymentDate: payment.payment_date || "",
      note: payment.note || "",
    });
  }

  function cancelEditPayment() {
    setEditingPaymentId(null);
    setEditingPaymentForm({
      memberId: "",
      amount: "",
      paymentDate: "",
      note: "",
    });
  }

  async function handleUpdatePayment(paymentId) {
    try {
      const response = await fetch(
        `${API_BASE}/tontines/${id}/payments/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPaymentForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la modification du paiement.");
      }

      setData(result);
      cancelEditPayment();
      showToast("Paiement modifié avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleDeletePayment(paymentId, memberName) {
    const ok = window.confirm(`Supprimer le paiement de "${memberName}" ?`);
    if (!ok) return;

    try {
      const response = await fetch(
        `${API_BASE}/tontines/${id}/payments/${paymentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la suppression du paiement.");
      }

      setData(result);
      showToast("Paiement supprimé avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleAddPayout(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/tontines/${id}/payouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payoutForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la redistribution.");
      }

      setPayoutForm({
        beneficiaryMemberId: "",
        roundLabel: "",
        amount: "",
        payoutDate: "",
        status: "paid",
      });

      setData(result);
      showToast("Redistribution enregistrée avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  function startEditPayout(item) {
    const linkedMember = data.members?.find(
      (member) => member.full_name === item.beneficiary_name
    );

    setEditingPayoutId(item.id);
    setEditingPayoutForm({
      beneficiaryMemberId: linkedMember ? String(linkedMember.id) : "",
      roundLabel: item.round_label || "",
      amount: item.amount ? String(item.amount) : "",
      payoutDate: item.payout_date || "",
      status: item.status || "paid",
    });
  }

  function cancelEditPayout() {
    setEditingPayoutId(null);
    setEditingPayoutForm({
      beneficiaryMemberId: "",
      roundLabel: "",
      amount: "",
      payoutDate: "",
      status: "paid",
    });
  }

  async function handleUpdatePayout(payoutId) {
    try {
      const response = await fetch(
        `${API_BASE}/tontines/${id}/payouts/${payoutId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPayoutForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la modification de la redistribution.");
      }

      setData(result);
      cancelEditPayout();
      showToast("Redistribution modifiée avec succès");
    } catch (err) {
      showToast(err.message || "Erreur réseau");
    }
  }

  async function handleDeletePayout(payoutId, beneficiaryName) {
    const ok = window.confirm(`Supprimer la redistribution de "${beneficiaryName}" ?`);
    if (!ok) return;

    try {
      const response = await fetch(
        `${API_BASE}/tontines/${id}/payouts/${payoutId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la suppression de la redistribution.");
      }

      setData(result);
      showToast("Redistribution supprimée avec succès");
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
          <p className="state-text">Chargement du dashboard...</p>
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
          <Link to="/tontines" className="secondary-action-btn">
            Retour aux tontines
          </Link>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-1" />
        <div className="ambient ambient-2" />
        <Navbar />
        <main className="page-shell">
          <p className="state-text">Aucune donnée disponible.</p>
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
            <h3>Modifier la tontine</h3>

            <form className="compact-form" onSubmit={handleUpdateTontine}>
              <input
                type="text"
                placeholder="Nom"
                value={tontineForm.name}
                onChange={(e) =>
                  setTontineForm({ ...tontineForm, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Montant"
                value={tontineForm.amount}
                onChange={(e) =>
                  setTontineForm({ ...tontineForm, amount: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Fréquence"
                value={tontineForm.frequency}
                onChange={(e) =>
                  setTontineForm({ ...tontineForm, frequency: e.target.value })
                }
              />

              <input
                type="date"
                value={tontineForm.startDate}
                onChange={(e) =>
                  setTontineForm({ ...tontineForm, startDate: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Description"
                value={tontineForm.description}
                onChange={(e) =>
                  setTontineForm({ ...tontineForm, description: e.target.value })
                }
              />

              <button type="submit" className="primary-action-btn">
                Enregistrer la tontine
              </button>
            </form>
          </article>

          <article className="dashboard-block glass-card">
            <h3>Ajouter un membre</h3>

            <form className="compact-form" onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="Nom complet"
                value={memberForm.fullName}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, fullName: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Téléphone"
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email (optionnel)"
                value={memberForm.email}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, email: e.target.value })
                }
              />

              <button type="submit" className="primary-action-btn">
                Ajouter le membre
              </button>
            </form>
          </article>
        </section>

        <section className="dashboard-grid" style={{ marginTop: "18px" }}>
          <article className="dashboard-block glass-card">
            <h3>Ajouter un paiement</h3>

            <form className="compact-form" onSubmit={handleAddPayment}>
              <select
                value={paymentForm.memberId}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, memberId: e.target.value })
                }
              >
                <option value="">Choisir un membre</option>
                {data.members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Montant"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
              />

              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Note (optionnelle)"
                value={paymentForm.note}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, note: e.target.value })
                }
              />

              <button type="submit" className="primary-action-btn">
                Enregistrer le paiement
              </button>
            </form>
          </article>

          <article className="dashboard-block glass-card">
            <h3>Enregistrer une redistribution</h3>

            <form className="compact-form" onSubmit={handleAddPayout}>
              <select
                value={payoutForm.beneficiaryMemberId}
                onChange={(e) =>
                  setPayoutForm({
                    ...payoutForm,
                    beneficiaryMemberId: e.target.value,
                  })
                }
              >
                <option value="">Choisir le bénéficiaire</option>
                {data.members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Libellé du tour (ex: Tour 1)"
                value={payoutForm.roundLabel}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, roundLabel: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Montant redistribué"
                value={payoutForm.amount}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, amount: e.target.value })
                }
              />

              <input
                type="date"
                value={payoutForm.payoutDate}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, payoutDate: e.target.value })
                }
              />

              <select
                value={payoutForm.status}
                onChange={(e) =>
                  setPayoutForm({ ...payoutForm, status: e.target.value })
                }
              >
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
              </select>

              <button type="submit" className="primary-action-btn">
                Enregistrer la redistribution
              </button>
            </form>
          </article>
        </section>

        <section className="dashboard-grid" style={{ marginTop: "18px" }}>
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

        <section className="dashboard-grid" style={{ marginTop: "18px" }}>
          <article className="dashboard-block glass-card">
            <h3>Membres</h3>

            <div className="member-status-list">
              {data.members?.length ? (
                data.members.map((member) => {
                  const status = getMemberStatus(member, data.tontine?.amount);

                  if (editingMemberId === member.id) {
                    return (
                      <div key={member.id} className="glass-subcard">
                        <div className="compact-form">
                          <input
                            type="text"
                            placeholder="Nom complet"
                            value={editingMemberForm.fullName}
                            onChange={(e) =>
                              setEditingMemberForm({
                                ...editingMemberForm,
                                fullName: e.target.value,
                              })
                            }
                          />

                          <input
                            type="text"
                            placeholder="Téléphone"
                            value={editingMemberForm.phone}
                            onChange={(e) =>
                              setEditingMemberForm({
                                ...editingMemberForm,
                                phone: e.target.value,
                              })
                            }
                          />

                          <input
                            type="email"
                            placeholder="Email"
                            value={editingMemberForm.email}
                            onChange={(e) =>
                              setEditingMemberForm({
                                ...editingMemberForm,
                                email: e.target.value,
                              })
                            }
                          />

                          <div className="inline-actions">
                            <button
                              type="button"
                              className="primary-action-btn"
                              onClick={() => handleUpdateMember(member.id)}
                            >
                              Enregistrer
                            </button>

                            <button
                              type="button"
                              className="secondary-action-btn"
                              onClick={cancelEditMember}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={member.id} className="status-row">
                      <div className="status-left">
                        <strong>{member.full_name}</strong>
                        <span>{member.phone || "Téléphone non renseigné"}</span>
                      </div>

                      <div className="status-center">
                        <span className={`member-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="status-right">
                        <strong>
                          {Number(member.total_paid || 0).toLocaleString()} FCFA
                        </strong>
                        <small>{member.payments_count || 0} paiement(s)</small>

                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary-action-btn"
                            onClick={() => startEditMember(member)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="danger-action-btn"
                            onClick={() => handleDeleteMember(member.id, member.full_name)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted">Aucun membre</p>
              )}
            </div>
          </article>

          <article className="dashboard-block glass-card">
            <h3>Paiements récents</h3>

            <div className="member-status-list">
              {data.recentPayments?.length ? (
                data.recentPayments.map((payment) => {
                  if (editingPaymentId === payment.id) {
                    return (
                      <div key={payment.id} className="glass-subcard">
                        <div className="compact-form">
                          <select
                            value={editingPaymentForm.memberId}
                            onChange={(e) =>
                              setEditingPaymentForm({
                                ...editingPaymentForm,
                                memberId: e.target.value,
                              })
                            }
                          >
                            <option value="">Choisir un membre</option>
                            {data.members?.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.full_name}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            placeholder="Montant"
                            value={editingPaymentForm.amount}
                            onChange={(e) =>
                              setEditingPaymentForm({
                                ...editingPaymentForm,
                                amount: e.target.value,
                              })
                            }
                          />

                          <input
                            type="date"
                            value={editingPaymentForm.paymentDate}
                            onChange={(e) =>
                              setEditingPaymentForm({
                                ...editingPaymentForm,
                                paymentDate: e.target.value,
                              })
                            }
                          />

                          <input
                            type="text"
                            placeholder="Note"
                            value={editingPaymentForm.note}
                            onChange={(e) =>
                              setEditingPaymentForm({
                                ...editingPaymentForm,
                                note: e.target.value,
                              })
                            }
                          />

                          <div className="inline-actions">
                            <button
                              type="button"
                              className="primary-action-btn"
                              onClick={() => handleUpdatePayment(payment.id)}
                            >
                              Enregistrer
                            </button>

                            <button
                              type="button"
                              className="secondary-action-btn"
                              onClick={cancelEditPayment}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
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

                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary-action-btn"
                            onClick={() => startEditPayment(payment)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="danger-action-btn"
                            onClick={() =>
                              handleDeletePayment(payment.id, payment.member_name)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
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
                data.payoutHistory.map((item) => {
                  if (editingPayoutId === item.id) {
                    return (
                      <div key={item.id} className="glass-subcard">
                        <div className="compact-form">
                          <select
                            value={editingPayoutForm.beneficiaryMemberId}
                            onChange={(e) =>
                              setEditingPayoutForm({
                                ...editingPayoutForm,
                                beneficiaryMemberId: e.target.value,
                              })
                            }
                          >
                            <option value="">Choisir le bénéficiaire</option>
                            {data.members?.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.full_name}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Libellé du tour"
                            value={editingPayoutForm.roundLabel}
                            onChange={(e) =>
                              setEditingPayoutForm({
                                ...editingPayoutForm,
                                roundLabel: e.target.value,
                              })
                            }
                          />

                          <input
                            type="number"
                            placeholder="Montant"
                            value={editingPayoutForm.amount}
                            onChange={(e) =>
                              setEditingPayoutForm({
                                ...editingPayoutForm,
                                amount: e.target.value,
                              })
                            }
                          />

                          <input
                            type="date"
                            value={editingPayoutForm.payoutDate}
                            onChange={(e) =>
                              setEditingPayoutForm({
                                ...editingPayoutForm,
                                payoutDate: e.target.value,
                              })
                            }
                          />

                          <select
                            value={editingPayoutForm.status}
                            onChange={(e) =>
                              setEditingPayoutForm({
                                ...editingPayoutForm,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="paid">Payé</option>
                            <option value="pending">En attente</option>
                          </select>

                          <div className="inline-actions">
                            <button
                              type="button"
                              className="primary-action-btn"
                              onClick={() => handleUpdatePayout(item.id)}
                            >
                              Enregistrer
                            </button>

                            <button
                              type="button"
                              className="secondary-action-btn"
                              onClick={cancelEditPayout}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
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

                        <div className="inline-actions">
                          <button
                            type="button"
                            className="secondary-action-btn"
                            onClick={() => startEditPayout(item)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="danger-action-btn"
                            onClick={() =>
                              handleDeletePayout(item.id, item.beneficiary_name)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted">Aucune redistribution enregistrée.</p>
              )}
            </div>
          </article>
        </section>

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
}