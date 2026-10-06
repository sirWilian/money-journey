import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, TrendingUp, Menu, X } from 'lucide-react';
import './App.css';

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

const NAV_LINKS = [
  { label: 'Dashboard',  href: '/',               active: true  },
  { label: 'Portfolio',  href: '#',               active: false },
  { label: 'Calculators',href: '/coast-fire.html',active: false },
  { label: 'Settings',   href: '#',               active: false },
];

export default function App() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
    const onOutside = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOutside); };
  }, []);

  return (
    <>
      {/* Nav */}
      <nav className="nav" ref={menuRef}>
        <div className="container nav__inner">
          <a href="/" className="nav__brand">
            <TrendingUp size={20} />
            Money Journey
          </a>

          <ul className="nav__links">
            {NAV_LINKS.map(l => (
              <li key={l.label}><a href={l.href} className={`nav__link${l.active ? ' nav__link--active' : ''}`}>{l.label}</a></li>
            ))}
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="nav__mobile">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className={`nav__mobile-link${l.active ? ' nav__mobile-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="main">
        <div className="container">

          {/* Page header */}
          <header className="page-header">
            <p className="page-header__eyebrow">Overview</p>
            <h1 className="page-header__title">Your Financial Journey</h1>
            <p className="page-header__subtitle">
              Track your path to financial independence. Monitor your savings rate, investment growth, and Coast FIRE milestones.
            </p>
          </header>

          {/* Stats row */}
          <div className="stats-row" style={{ marginBottom: 'var(--space-8)' }}>
            {[
              { label: 'Net Worth',        value: 'R$ 284.5k', sub: '+12.4% this year',  positive: true  },
              { label: 'Monthly Savings',  value: 'R$ 4.2k',   sub: '42% savings rate',  positive: true  },
              { label: 'Coast FIRE Target', value: 'R$ 600k',  sub: '47% of goal',       positive: null  },
              { label: 'Years to FIRE',    value: '14 yrs',    sub: 'at current pace',   positive: null  },
            ].map(stat => (
              <div key={stat.label} className="card">
                <div className="stat">
                  <span className="stat__label">{stat.label}</span>
                  <span className="stat__value num">{stat.value}</span>
                  <span className={`stat__sub ${stat.positive === true ? 'text-positive' : stat.positive === false ? 'text-negative' : ''}`}>
                    {stat.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Two-column */}
          <div className="grid grid--2" style={{ marginBottom: 'var(--space-8)' }}>

            {/* Recent transactions */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>Recent Transactions</h2>
                <button className="btn btn--ghost btn--sm">View all</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { name: 'Salary',         cat: 'Income',     amount: '+R$ 8,500', positive: true  },
                  { name: 'Rent',           cat: 'Housing',    amount: '-R$ 2,200', positive: false },
                  { name: 'Investments',    cat: 'Savings',    amount: '-R$ 2,500', positive: true  },
                  { name: 'Groceries',      cat: 'Food',       amount: '-R$ 420',   positive: false },
                  { name: 'Freelance',      cat: 'Income',     amount: '+R$ 1,200', positive: true  },
                ].map((tx, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{tx.name}</p>
                      <span className="badge badge--neutral">{tx.cat}</span>
                    </div>
                    <span className={`num font-medium ${tx.positive ? 'text-positive' : 'text-negative'}`} style={{ fontSize: 'var(--text-sm)' }}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation */}
            <div className="card">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>Portfolio Allocation</h2>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>Current asset distribution</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { label: 'Brazilian Stocks (IBOV)', pct: 35, color: 'var(--color-brand-500)'  },
                  { label: 'Global ETFs',             pct: 30, color: 'var(--color-success)'     },
                  { label: 'Fixed Income',            pct: 25, color: 'var(--color-warning)'     },
                  { label: 'Real Estate FIIs',        pct: 10, color: 'var(--color-danger)'      },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className="num" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              <hr className="divider" style={{ marginTop: 'var(--space-5)' }} />

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn--primary btn--sm">Rebalance</button>
                <button className="btn btn--secondary btn--sm">Edit targets</button>
              </div>
            </div>
          </div>

          {/* Calculators row */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Financial Calculators</h2>
          <div className="grid grid--auto">
            {[
              { title: 'Coast FIRE',       desc: 'Find out how much you need invested today to coast to retirement.',  badge: 'Popular', href: '/coast-fire.html' },
              { title: 'Compound Interest',desc: 'Visualize the power of compound interest over time.',                badge: null,      href: '#'               },
              { title: 'Savings Rate',     desc: 'Calculate and optimize your monthly savings rate.',                  badge: 'New',     href: '#'               },
            ].map(calc => (
              <div key={calc.title} className="card card--interactive">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)' }}>{calc.title}</h3>
                  {calc.badge && <span className="badge badge--brand">{calc.badge}</span>}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>{calc.desc}</p>
                <a href={calc.href} className="btn btn--secondary btn--sm">Open calculator</a>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-6) 0', marginTop: 'var(--space-8)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            © 2026 Money Journey
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Not financial advice
          </span>
        </div>
      </footer>
    </>
  );
}
