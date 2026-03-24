import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar-global">
      <nav className="topbar glass-card">
        <div className="brand-row">
          <div className="brand-mark">S</div>
          <div className="brand-copy">
            <strong>SamaTontine</strong>
            <p>Gestion premium de tontines au Sénégal</p>
          </div>
        </div>

        <button
          type="button"
          className="burger-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <>
          <button
            type="button"
            className="menu-overlay"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          />

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
              to="/tontines"
              onClick={closeMenu}
              className={location.pathname.startsWith("/dashboard") ? "active-link" : ""}
            >
              Dashboard
            </Link>

           <Link to="/login-admin">Admin</Link>

          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;