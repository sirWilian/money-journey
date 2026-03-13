import { NavLink } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import './Navbar.scss';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/">Money Journey</NavLink>
      </div>

      <ul className="navbar-links">
        <li><NavLink to="/">Inicio</NavLink></li>
        <li><NavLink to="/banks">Bancos</NavLink></li>
        <li><NavLink to="/expenses">Despesas</NavLink></li>
        <li><NavLink to="/balance">Saldos</NavLink></li>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li>
          <button className="theme-toggle" onClick={toggleTheme} title="Trocar Tema">
            {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
          </button>
        </li>
      </ul>
    </nav>
  );
}
