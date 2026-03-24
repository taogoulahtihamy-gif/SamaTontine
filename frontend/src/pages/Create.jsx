import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);
console.log("API_BASE =", API_BASE);
const emptyMember = () => ({
  fullName: "",
  phone: "",
  email: "",
});

function Create() {
  const navigate = useNavigate();

  const [toast, setToast] = useState("");
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    amount: 10000,
    frequency: "Mensuelle",
    startDate: "",
    description: "",
    members: [emptyMember(), emptyMember()],
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

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
    setCreating(true);

    try {
      const response = await fetch(`${API_BASE}/tontines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création.");
      }

      setToast("Tontine créée avec succès.");

      setForm({
        name: "",
        amount: 10000,
        frequency: "Mensuelle",
        startDate: "",
        description: "",
        members: [emptyMember(), emptyMember()],
      });

      setTimeout(() => {
        navigate("/tontines");
      }, 800);
    } catch (error) {
      setToast(error.message || "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  }

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
            <p>
              Lance un nouveau groupe avec son montant, sa fréquence et ses
              premiers membres.
            </p>
          </div>

          <form className="form-grid" onSubmit={createTontine}>
            <label>
              Nom de la tontine
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Ex : Tontine Nio Far"
                required
              />
            </label>

            <label>
              Montant de cotisation (FCFA)
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                required
              />
            </label>

            <label>
              Fréquence
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </label>

            <label className="full-span">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Objectif du groupe, règles internes, notes..."
              />
            </label>

            <div className="full-span members-builder">
              <div className="section-inline-head">
                <h3>Membres au démarrage</h3>
                <button
                  type="button"
                  className="small-btn"
                  onClick={addMemberField}
                >
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
                      onChange={(e) =>
                        updateMember(index, "fullName", e.target.value)
                      }
                    />

                    <input
                      placeholder="Téléphone"
                      value={member.phone}
                      onChange={(e) =>
                        updateMember(index, "phone", e.target.value)
                      }
                    />

                    <input
                      placeholder="Email (optionnel)"
                      value={member.email}
                      onChange={(e) =>
                        updateMember(index, "email", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="full-span align-right">
              <button className="primary-btn" type="submit" disabled={creating}>
                {creating ? "Création en cours..." : "Créer la tontine"}
              </button>
            </div>
          </form>
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Create;