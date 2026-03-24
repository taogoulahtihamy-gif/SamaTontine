import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://samatontine.onrender.com/api";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    password: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoadingLogin(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: loginForm.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur de connexion.");
      }

      localStorage.setItem("adminToken", result.token);
      setSuccess("Connexion réussie.");
      navigate("/tontines");
    } catch (err) {
      setError(err.message || "Erreur réseau");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoadingChange(true);
    setError("");
    setSuccess("");

    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        throw new Error("Tous les champs du changement de mot de passe sont obligatoires.");
      }

      if (passwordForm.newPassword.length < 6) {
        throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("La confirmation du nouveau mot de passe ne correspond pas.");
      }

      const response = await fetch(`${API_BASE}/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors du changement de mot de passe.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Mot de passe admin modifié avec succès.");
    } catch (err) {
      setError(err.message || "Erreur réseau");
    } finally {
      setLoadingChange(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <Navbar />

      <main className="page-shell">
        <section className="admin-auth-shell">
          <div className="admin-auth-hero glass-card">
            <span className="section-chip">Admin sécurisé</span>
            <h1>Espace administration</h1>
            <p>
              Connecte-toi pour gérer les tontines, les membres, les paiements et les redistributions.
            </p>
          </div>

          <div className="admin-auth-grid">
            <article className="dashboard-block glass-card">
              <h3>Connexion admin</h3>

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <form className="compact-form" onSubmit={handleLogin}>
                <div className="password-field-wrap">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Mot de passe admin"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={loadingLogin}
                >
                  {loadingLogin ? "Connexion..." : "Se connecter"}
                </button>
              </form>
            </article>

            <article className="dashboard-block glass-card">
              <h3>Modifier le mot de passe admin</h3>

              <form className="compact-form" onSubmit={handleChangePassword}>
                <div className="password-field-wrap">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Mot de passe actuel"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <div className="password-field-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <div className="password-field-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer le nouveau mot de passe"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="secondary-action-btn"
                  disabled={loadingChange}
                >
                  {loadingChange ? "Mise à jour..." : "Modifier le mot de passe"}
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}