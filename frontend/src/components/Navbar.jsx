import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = !!localStorage.getItem("adminToken");

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("adminToken");
    closeMenu();
    navigate("/login-admin");
  }

  return (
    <>
      <nav className="topbar glass-card navbar-global">
        <div className="brand-row">
          <div className="brand-mark">S</div>

          <div className="brand-copy">
            <strong>SamaTontine</strong>
            <p>Gestion premium de tontines au Sénégal</p>
          </div>
        </div>

        <div className="desktop-nav-actions">
          <Link
            to="/"
            className={location.pathname === "/" ? "nav-link active-nav-link" : "nav-link"}
          >
            Accueil
          </Link>

          <Link
            to="/tontines"
            className={location.pathname === "/tontines" ? "nav-link active-nav-link" : "nav-link"}
          >
            Tontines
          </Link>

          {isAdmin ? (
            <>
              <Link
                to="/create"
                className={location.pathname === "/create" ? "nav-link active-nav-link" : "nav-link"}
              >
                Créer
              </Link>

              <button
                type="button"
                className="secondary-action-btn nav-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login-admin"
              className={location.pathname === "/login-admin" ? "primary-action-btn" : "secondary-action-btn"}
            >
              Admin
            </Link>
          )}
        </div>

        <button
          className="burger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
          type="button"
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu}></div>

          <div className="mobile-menu glass-card">
            <Link
              to="/"
              onClick={closeMenu}
              className={location.pathname === "/" ? "active-link" : ""}
            >
              Accueil
            </Link>

            <Link
              to="/tontines"
              onClick={closeMenu}
              className={location.pathname === "/tontines" ? "active-link" : ""}
            >
              Tontines
            </Link>

            {isAdmin ? (
              <>
                <Link
                  to="/create"
                  onClick={closeMenu}
                  className={location.pathname === "/create" ? "active-link" : ""}
                >
                  Créer
                </Link>

                <button
                  type="button"
                  className="mobile-menu-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login-admin"
                onClick={closeMenu}
                className={location.pathname === "/login-admin" ? "active-link" : ""}
              >
                Admin
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;