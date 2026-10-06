import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000';

const MOCK_TRANSACTIONS = [
  { id: 1, name: 'Salary',      category: 'Income',  amount: 8500, is_income: true  },
  { id: 2, name: 'Rent',        category: 'Housing', amount: 2200, is_income: false },
  { id: 3, name: 'Investments', category: 'Savings', amount: 2500, is_income: true  },
  { id: 4, name: 'Groceries',   category: 'Food',    amount: 420,  is_income: false },
  { id: 5, name: 'Freelance',   category: 'Income',  amount: 1200, is_income: true  },
];

const STATS = [
  { label: 'Net Worth',         value: 'R$ 284.5k', sub: '+12.4% this year', positive: true  },
  { label: 'Monthly Savings',   value: 'R$ 4.2k',   sub: '42% savings rate', positive: true  },
  { label: 'Coast FIRE Target', value: 'R$ 600k',   sub: '47% of goal',      positive: null  },
  { label: 'Years to FIRE',     value: '14 yrs',    sub: 'at current pace',  positive: null  },
];

const ALLOCATION = [
  { label: 'Brazilian Stocks (IBOV)', pct: 35, color: 'var(--color-brand-500)'  },
  { label: 'Global ETFs',             pct: 30, color: 'var(--color-success)'    },
  { label: 'Fixed Income',            pct: 25, color: 'var(--color-warning)'    },
  { label: 'Real Estate FIIs',        pct: 10, color: 'var(--color-danger)'     },
];

const CALCULATORS = [
  { title: 'Coast FIRE',        desc: 'Find out how much you need invested today to coast to retirement.',  badge: 'Popular', href: '/calculators/coast-fire' },
  { title: 'Compound Interest', desc: 'Visualize the power of compound interest over time.',                badge: null,      href: '#'                       },
  { title: 'Savings Rate',      desc: 'Calculate and optimize your monthly savings rate.',                  badge: 'New',     href: '#'                       },
];

const fmtAmount = (amount, isIncome) => {
  const abs = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(amount);
  return `${isIncome ? '+' : '-'}R$ ${abs}`;
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/expenses/`)
      .then(r => { if (r.data.length > 0) setTransactions(r.data); })
      .catch(() => {}) // keep mock data if API is unreachable
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <main className="main">
        <div className="container">

          <header className="page-header">
            <p className="page-header__eyebrow">Overview</p>
            <h1 className="page-header__title">Your Financial Journey</h1>
            <p className="page-header__subtitle">
              Track your path to financial independence. Monitor your savings rate, investment growth, and Coast FIRE milestones.
            </p>
          </header>

          {/* Stats */}
          <div className="stats-row" style={{ marginBottom: 'var(--space-8)' }}>
            {STATS.map(stat => (
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

              {loading ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Loading…</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {transactions.map((tx, i) => (
                    <div key={tx.id ?? i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-2) 0',
                      borderBottom: i < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {tx.name}
                        </p>
                        <span className="badge badge--neutral">{tx.category}</span>
                      </div>
                      <span className={`num font-medium ${tx.is_income ? 'text-positive' : 'text-negative'}`}
                        style={{ fontSize: 'var(--text-sm)' }}>
                        {fmtAmount(tx.amount, tx.is_income)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio allocation */}
            <div className="card">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>Portfolio Allocation</h2>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', color: 'var(--text-secondary)' }}>
                  Current asset distribution
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {ALLOCATION.map(item => (
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

          {/* Calculators */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Financial Calculators</h2>
          <div className="grid grid--auto">
            {CALCULATORS.map(calc => (
              <div key={calc.title} className="card card--interactive">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)' }}>{calc.title}</h3>
                  {calc.badge && <span className="badge badge--brand">{calc.badge}</span>}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {calc.desc}
                </p>
                {calc.href.startsWith('/') ? (
                  <Link to={calc.href} className="btn btn--secondary btn--sm">Open calculator</Link>
                ) : (
                  <a href={calc.href} className="btn btn--secondary btn--sm">Open calculator</a>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-6) 0', marginTop: 'var(--space-8)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>© 2026 Money Journey</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Not financial advice</span>
        </div>
      </footer>
    </>
  );
}
