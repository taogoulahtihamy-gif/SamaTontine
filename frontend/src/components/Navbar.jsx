import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="topbar glass-card navbar-global">
        <div className="brand-row">
          <div className="brand-mark">S</div>
          <div>
            <strong>SamaTontine</strong>
            <p>Gestion premium de tontines au Sénégal</p>
          </div>
        </div>

        <button
          className="burger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
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

            <Link
              to="/create"
              onClick={closeMenu}
              className={location.pathname === "/create" ? "active-link" : ""}
            >
              Créer
            </Link>

            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={location.pathname === "/dashboard" ? "active-link" : ""}
            >
              Dashboard
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;