import { NavLink } from 'react-router-dom';
import './Navbar.scss';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/">💸 Money Journey</NavLink>
      </div>
      
      <ul className="navbar-links" style={{ display: 'flex', alignItems: 'center' }}>
        <li><NavLink to="/">Início</NavLink></li>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        
        <li>
          <button 
            onClick={toggleTheme} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginLeft: '1rem'
            }}
            title="Trocar Tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </li>
      </ul>
    </nav>
  );
}