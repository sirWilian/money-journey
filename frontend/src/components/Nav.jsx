import { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Nav({ links }) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
    const onOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, []);

  const isActive = href => {
    if (!href.startsWith('/')) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const renderLink = (l, mobile = false) => {
    const active = isActive(l.href);
    const base = mobile ? 'nav__mobile-link' : 'nav__link';
    const cls = active ? `${base} ${base}--active` : base;
    const handleClick = mobile ? () => setMenuOpen(false) : undefined;
    if (l.href.startsWith('/')) {
      return <Link key={l.label} to={l.href} className={cls} onClick={handleClick}>{l.label}</Link>;
    }
    return <a key={l.label} href={l.href} className={cls} onClick={handleClick}>{l.label}</a>;
  };

  return (
    <nav className="nav" ref={menuRef}>
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <TrendingUp size={20} />
          Money Journey
        </Link>

        <ul className="nav__links">
          {links.map(l => <li key={l.label}>{renderLink(l)}</li>)}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="nav__hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav__mobile">
          {links.map(l => renderLink(l, true))}
        </div>
      )}
    </nav>
  );
}
