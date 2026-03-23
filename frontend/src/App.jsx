import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const emptyMember = () => ({ fullName: '', phone: '', email: '' });

const currency = (value) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR').format(date);
};

function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card glass-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="section-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function MemberStatusBadge({ member, tontineAmount }) {
  const totalPaid = Number(member?.total_paid || 0);
  const unitAmount = Number(tontineAmount || 0);

  let status = 'pending';
  let label = 'En attente';

  if (totalPaid > 0 && unitAmount > 0 && totalPaid < unitAmount) {
    status = 'partial';
    label = 'Partiel';
  }

  if (unitAmount > 0 && totalPaid >= unitAmount) {
    status = 'paid';
    label = 'Payé';
  }

  return <span className={`member-badge ${status}`}>{label}</span>;
}

export default function App() {
  const [tontines, setTontines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [creatingTontine, setCreatingTontine] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [addingPayout, setAddingPayout] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [form, setForm] = useState({
    name: '',
    amount: 10000,
    frequency: 'Mensuelle',
    startDate: '',
    description: '',
    members: [emptyMember(), emptyMember()],
  });

  const [paymentForm, setPaymentForm] = useState({
    memberId: '',
    amount: '',
    paymentDate: '',
    note: '',
  });

  const [payoutForm, setPayoutForm] = useState({
    beneficiaryMemberId: '',
    roundLabel: '',
    amount: '',
    payoutDate: '',
  });

  const [memberForm, setMemberForm] = useState(emptyMember());

  const selectedTontine = useMemo(
    () => tontines.find((item) => Number(item.id) === Number(selectedId)),
    [tontines, selectedId]
  );

  useEffect(() => {
    loadTontines();
  }, []);

  useEffect(() => {
    if (selectedId) loadDashboard(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadTontines() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tontines`);
      const data = await response.json();
      setTontines(data);
      if (!selectedId && data.length) setSelectedId(data[0].id);
    } catch (error) {
      setToast('Impossible de charger les tontines.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(id) {
    setDashboardLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tontines/${id}`);
      const data = await response.json();
      setDashboard(data);

      setPaymentForm((prev) => ({
        ...prev,
        memberId: data.members?.[0]?.id || '',
        amount: data.tontine?.amount || '',
      }));

      setPayoutForm((prev) => ({
        ...prev,
        beneficiaryMemberId: data.nextBeneficiary?.id || data.members?.[0]?.id || '',
        amount: data.tontine?.amount ? data.tontine.amount * data.members.length : '',
      }));
    } catch (error) {
      setToast('Impossible de charger le tableau de bord.');
    } finally {
      setDashboardLoading(false);
    }
  }

  function updateMember(index, field, value) {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  }

  function addMemberField() {
    setForm((current) => ({
      ...current,
      members: [...current.members, emptyMember()],
    }));
  }

  async function createTontine(e) {
    e.preventDefault();
    setCreatingTontine(true);

    try {
      const response = await fetch(`${API_BASE}/tontines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      setToast('Tontine créée avec succès.');

      setForm({
        name: '',
        amount: 10000,
        frequency: 'Mensuelle',
        startDate: '',
        description: '',
        members: [emptyMember(), emptyMember()],
      });

      await loadTontines();
      setSelectedId(data.tontine.id);
      setDashboard(data);
    } catch (error) {
      setToast(error.message || 'Erreur lors de la création.');
    } finally {
      setCreatingTontine(false);
    }
  }

  async function addPayment(e) {
    e.preventDefault();
    if (!selectedId) return;

    setAddingPayment(true);

    try {
      const response = await fetch(`${API_BASE}/tontines/${selectedId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      setToast('Paiement enregistré.');
      setPaymentForm((prev) => ({ ...prev, note: '', paymentDate: '' }));
      await loadDashboard(selectedId);
      await loadTontines();
    } catch (error) {
      setToast(error.message || 'Erreur lors de l’enregistrement du paiement.');
    } finally {
      setAddingPayment(false);
    }
  }

  async function addPayout(e) {
    e.preventDefault();
    if (!selectedId) return;

    setAddingPayout(true);

    try {
      const response = await fetch(`${API_BASE}/tontines/${selectedId}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payoutForm, status: 'paid' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      setToast('Tour de redistribution enregistré.');
      setPayoutForm((prev) => ({ ...prev, roundLabel: '', payoutDate: '' }));
      await loadDashboard(selectedId);
    } catch (error) {
      setToast(error.message || 'Erreur lors de l’enregistrement du tour.');
    } finally {
      setAddingPayout(false);
    }
  }

  async function addNewMember(e) {
    e.preventDefault();
    if (!selectedId) return;

    setAddingMember(true);

    try {
      const response = await fetch(`${API_BASE}/tontines/${selectedId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      setToast('Nouveau membre ajouté.');
      setMemberForm(emptyMember());
      await loadDashboard(selectedId);
      await loadTontines();
    } catch (error) {
      setToast(error.message || 'Erreur lors de l’ajout du membre.');
    } finally {
      setAddingMember(false);
    }
  }

  const progress = useMemo(() => {
    if (!dashboard?.members?.length || !dashboard?.tontine?.amount) return 0;
    const target = dashboard.members.length * Number(dashboard.tontine.amount);
    return Math.min(
      100,
      Math.round((Number(dashboard.totals?.total_collected || 0) / target) * 100)
    );
  }, [dashboard]);

  const expectedCycleAmount = useMemo(() => {
    if (!dashboard?.members?.length || !dashboard?.tontine?.amount) return 0;
    return dashboard.members.length * Number(dashboard.tontine.amount);
  }, [dashboard]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <header className="hero">
        <nav className="topbar glass-card">
          <div>
            <div className="brand-row">
              <div className="brand-mark">S</div>
              <div>
                <strong>SamaTontine</strong>
                <p>Gestion premium de tontines au Sénégal</p>
              </div>
            </div>
          </div>
          <div className="topbar-badge">MVP prêt à tester</div>
        </nav>

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
  <a href="#create" className="primary-btn">Créer une tontine</a>
  <a href="#dashboard" className="ghost-btn">Voir le tableau de bord</a>
</div>
          </section>

          <section className="hero-panel glass-card">
            <div className="mini-grid">
              <StatCard
                label="Tontines créées"
                value={tontines.length}
                helper="toutes visibles à gauche"
              />
              <StatCard
                label="Collecte globale"
                value={currency(
                  tontines.reduce((acc, item) => acc + Number(item.total_collected || 0), 0)
                )}
                helper="sur cette installation"
              />
            </div>

            <div className="hero-visual">
              <div className="ring ring-a"></div>
              <div className="ring ring-b"></div>
              <div className="visual-card glass-card">
                <p>Prochain bénéficiaire</p>
                <strong>{dashboard?.nextBeneficiary?.full_name || 'À définir'}</strong>
                <span>
                  {dashboard
                    ? `Cotisation ${currency(dashboard.tontine.amount)}`
                    : 'Crée une première tontine'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </header>

      <main className="main-grid mobile-main">
        <aside className="sidebar glass-card">
          <div className="sidebar-head">
            <h3>Mes tontines</h3>
            <button onClick={loadTontines} className="small-btn">
              {loading ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>

          <div className="list-stack">
            {loading && <p className="muted">Chargement...</p>}
            {!loading && tontines.length === 0 && (
              <p className="muted">Aucune tontine pour le moment.</p>
            )}

            {tontines.map((item) => (
              <button
                key={item.id}
                className={`tontine-list-item ${Number(selectedId) === Number(item.id) ? 'active' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.frequency} · {item.members_count} membres
                  </span>
                </div>
                <b>{currency(item.amount)}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="content-column mobile-content">
          <section id="create" className="panel glass-card create-panel">
            <SectionTitle
              eyebrow="Lancement rapide"
              title="Créer une nouvelle tontine"
              text="On démarre avec une première version très solide : groupe, membres, paiements et suivi du bénéficiaire."
            />

            <form className="form-grid" onSubmit={createTontine}>
              <label>
                Nom de la tontine
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex : Tontine Nio Far"
                  required
                />
              </label>

              <label>
                Montant de cotisation (FCFA)
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  required
                />
              </label>

              <label>
                Fréquence
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                  <option>Hebdomadaire</option>
                  <option>Mensuelle</option>
                  <option>Quinzaine</option>
                </select>
              </label>

              <label>
                Date de démarrage
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </label>

              <label className="full-span">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Objectif du groupe, règles internes, notes..."
                />
              </label>

              <div className="full-span members-builder">
                <div className="section-inline-head">
                  <h3>Membres au démarrage</h3>
                  <button type="button" className="small-btn" onClick={addMemberField}>
                    Ajouter un membre
                  </button>
                </div>

                <div className="member-grid">
                  {form.members.map((member, index) => (
                    <div key={index} className="member-card">
                      <h4>Membre {index + 1}</h4>
                      <input
                        placeholder="Nom complet"
                        value={member.fullName}
                        onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                      />
                      <input
                        placeholder="Téléphone"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                      />
                      <input
                        placeholder="Email (optionnel)"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="full-span align-right">
                <button className="primary-btn" type="submit" disabled={creatingTontine}>
                  {creatingTontine ? 'Création en cours...' : 'Créer la tontine'}
                </button>
              </div>
            </form>
          </section>

          <section id="dashboard" className="panel glass-card">
            <SectionTitle
              eyebrow="Pilotage"
              title={selectedTontine ? `Tableau de bord — ${selectedTontine.name}` : 'Sélectionne une tontine'}
              text="Un cockpit visuel pensé pour voir l’essentiel en quelques secondes."
            />

            {dashboardLoading ? (
              <p className="muted">Chargement du tableau de bord...</p>
            ) : !dashboard ? (
              <p className="muted">Crée ou sélectionne une tontine pour afficher le tableau de bord.</p>
            ) : (
              <>
                <div className="stats-grid">
                  <StatCard
                    label="Collecté"
                    value={currency(dashboard.totals.total_collected)}
                    helper={`${dashboard.totals.payments_count} paiements`}
                  />
                  <StatCard
                    label="Montant par cotisation"
                    value={currency(dashboard.tontine.amount)}
                    helper={dashboard.tontine.frequency}
                  />
                  <StatCard
                    label="Objectif du cycle"
                    value={currency(expectedCycleAmount)}
                    helper={`${dashboard.members.length} membres x ${currency(dashboard.tontine.amount)}`}
                  />
                  <StatCard
                    label="Prochain bénéficiaire"
                    value={dashboard.nextBeneficiary?.full_name || 'À définir'}
                    helper="selon l’ordre actuel"
                  />
                </div>

                <div className="progress-panel">
                  <div className="progress-head">
                    <strong>Avancement de la collecte du cycle</strong>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-block glass-subcard">
                    <div className="section-inline-head">
                      <h3>Membres & statut</h3>
                      <span className="tag-soft">ordre de passage inclus</span>
                    </div>

                    <div className="member-status-list">
                      {dashboard.members.map((member) => (
                        <div key={member.id} className="status-row">
                          <div className="status-left">
                            <strong>{member.full_name}</strong>
                            <span>
                              {member.phone} · Position {member.position || '-'}
                            </span>
                          </div>

                          <div className="status-center">
                            <MemberStatusBadge
                              member={member}
                              tontineAmount={dashboard.tontine.amount}
                            />
                          </div>

                          <div className="status-right">
                            <b>{currency(member.total_paid)}</b>
                            <small>{member.payments_count} paiement(s)</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-block glass-subcard">
                    <div className="section-inline-head">
                      <h3>Enregistrer un paiement</h3>
                      <span className="tag-soft">manuel pour le MVP</span>
                    </div>

                    <form className="compact-form" onSubmit={addPayment}>
                      <select
                        value={paymentForm.memberId}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, memberId: e.target.value })
                        }
                        required
                      >
                        <option value="">Choisir un membre</option>
                        {dashboard.members.map((member) => (
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
                        required
                      />

                      <input
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                        }
                        required
                      />

                      <textarea
                        placeholder="Note (optionnelle)"
                        value={paymentForm.note}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, note: e.target.value })
                        }
                      />

                      <button className="primary-btn" type="submit" disabled={addingPayment}>
                        {addingPayment ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </form>
                  </div>

                  <div className="dashboard-block glass-subcard">
                    <div className="section-inline-head">
                      <h3>Tour de redistribution</h3>
                      <span className="tag-soft">bénéficiaire du cycle</span>
                    </div>

                    <form className="compact-form" onSubmit={addPayout}>
                      <select
                        value={payoutForm.beneficiaryMemberId}
                        onChange={(e) =>
                          setPayoutForm({ ...payoutForm, beneficiaryMemberId: e.target.value })
                        }
                        required
                      >
                        <option value="">Choisir le bénéficiaire</option>
                        {dashboard.members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.full_name}
                          </option>
                        ))}
                      </select>

                      <input
                        placeholder="Tour (ex : Avril 2026)"
                        value={payoutForm.roundLabel}
                        onChange={(e) =>
                          setPayoutForm({ ...payoutForm, roundLabel: e.target.value })
                        }
                        required
                      />

                      <input
                        type="number"
                        placeholder="Montant redistribué"
                        value={payoutForm.amount}
                        onChange={(e) =>
                          setPayoutForm({ ...payoutForm, amount: e.target.value })
                        }
                        required
                      />

                      <input
                        type="date"
                        value={payoutForm.payoutDate}
                        onChange={(e) =>
                          setPayoutForm({ ...payoutForm, payoutDate: e.target.value })
                        }
                        required
                      />

                      <button className="primary-btn" type="submit" disabled={addingPayout}>
                        {addingPayout ? 'Validation...' : 'Valider le tour'}
                      </button>
                    </form>
                  </div>

                  <div className="dashboard-block glass-subcard">
                    <div className="section-inline-head">
                      <h3>Ajouter un membre</h3>
                      <span className="tag-soft">après création</span>
                    </div>

                    <form className="compact-form" onSubmit={addNewMember}>
                      <input
                        placeholder="Nom complet"
                        value={memberForm.fullName}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, fullName: e.target.value })
                        }
                        required
                      />

                      <input
                        placeholder="Téléphone"
                        value={memberForm.phone}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, phone: e.target.value })
                        }
                        required
                      />

                      <input
                        placeholder="Email (optionnel)"
                        value={memberForm.email}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, email: e.target.value })
                        }
                      />

                      <button className="primary-btn" type="submit" disabled={addingMember}>
                        {addingMember ? 'Ajout...' : 'Ajouter'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="history-grid">
                  <div className="history-card glass-subcard">
                    <div className="section-inline-head">
                      <h3>Derniers paiements</h3>
                      <span className="tag-soft">traçabilité</span>
                    </div>

                    {dashboard.recentPayments.length === 0 ? (
                      <p className="muted">Aucun paiement enregistré.</p>
                    ) : (
                      dashboard.recentPayments.map((payment) => (
                        <div key={payment.id} className="history-row">
                          <div>
                            <strong>{payment.member_name}</strong>
                            <span>{formatDate(payment.payment_date)}</span>
                          </div>
                          <b>{currency(payment.amount)}</b>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="history-card glass-subcard">
                    <div className="section-inline-head">
                      <h3>Historique des bénéficiaires</h3>
                      <span className="tag-soft">cycles distribués</span>
                    </div>

                    {dashboard.payoutHistory.length === 0 ? (
                      <p className="muted">Aucun tour encore validé.</p>
                    ) : (
                      dashboard.payoutHistory.map((payout) => (
                        <div key={payout.id} className="history-row">
                          <div>
                            <strong>{payout.beneficiary_name}</strong>
                            <span>
                              {payout.round_label} · {formatDate(payout.payout_date)}
                            </span>
                          </div>
                          <b>{currency(payout.amount)}</b>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}