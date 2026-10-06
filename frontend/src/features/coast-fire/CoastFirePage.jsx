import { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext.jsx';
import { calculateCoastFire } from './calculateCoastFire.js';

const STORAGE_KEY = 'coast-fire-inputs';

const DEFAULT_STATE = {
  currentAge: 30,
  retirementAge: 65,
  currentPortfolio: 50_000,
  annualSpending: 60_000,
  swr: 4.0,
  inflationRate: 3.0,
  returnRate: 8.0,
  showRealValues: true,
  periods: [
    { id: 1, durationMonths: 60,  monthlyContribution: 1000 },
    { id: 2, durationMonths: 120, monthlyContribution: 500  },
  ],
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_STATE;
  }
}

const fmt = v =>
  isNaN(v) || !isFinite(v)
    ? '$0'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const fmtCompact = v => {
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'k';
  return '$' + Math.round(v);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function InputGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: 'var(--space-2)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, prefix, suffix, step = 1, min = 0, max }) {
  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-secondary)', fontWeight: 600, userSelect: 'none', pointerEvents: 'none', zIndex: 1 }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={e => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && v >= min) onChange(v);
        }}
        onBlur={e => { if (!e.target.value) e.target.value = value; }}
        className="cf-num-input num"
        style={{
          width: '100%',
          padding: `0.5rem ${suffix ? '2.5rem' : '0.75rem'} 0.5rem ${prefix ? '2rem' : '0.75rem'}`,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
        }}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-secondary)', fontWeight: 600, userSelect: 'none', pointerEvents: 'none' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function PeriodCard({ period, index, onChange, onRemove }) {
  const yrs = Math.floor(period.durationMonths / 12);
  const mos = period.durationMonths % 12;

  return (
    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <span className="badge badge--brand" style={{ fontSize: 'var(--text-xs)' }}>Phase {index + 1}</span>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onRemove(period.id)}
          style={{ color: 'var(--color-danger)', padding: '2px 8px' }}
          aria-label="Remove phase"
        >
          ×
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
            Duration
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <NumInput suffix="yr" value={yrs} min={0}
              onChange={v => onChange(period.id, 'durationMonths', Math.round(v) * 12 + mos)} />
            <NumInput suffix="mo" value={mos} min={0} max={11}
              onChange={v => onChange(period.id, 'durationMonths', yrs * 12 + Math.min(Math.round(v), 11))} />
          </div>
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>
            Monthly Saving
          </p>
          <NumInput prefix="$" value={period.monthlyContribution} min={0}
            onChange={v => onChange(period.id, 'monthlyContribution', v)} />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      {dashed
        ? <div style={{ width: 16, height: 0, borderTop: `2px dashed ${color}` }} />
        : <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      }
      <span>{label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CoastFirePage() {
  const { theme } = useTheme();
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const result = calculateCoastFire(state);

  const set = (key, value) => setState(s => ({ ...s, [key]: value }));

  const addPeriod = () => setState(s => ({
    ...s,
    periods: [...s.periods, { id: Date.now(), durationMonths: 12, monthlyContribution: 500 }],
  }));

  const removePeriod = id => setState(s => ({ ...s, periods: s.periods.filter(p => p.id !== id) }));

  const updatePeriod = (id, key, value) => setState(s => ({
    ...s,
    periods: s.periods.map(p => p.id === id ? { ...p, [key]: value } : p),
  }));

  const realReturn = state.returnRate - state.inflationRate;
  const totalMonths = state.periods.reduce((sum, p) => sum + p.durationMonths, 0);
  const maxMonths = (state.retirementAge - state.currentAge) * 12;
  const overBudget = totalMonths > maxMonths;

  // Chart setup
  const dark = theme === 'dark';
  const textColor = dark ? '#a1a1aa' : '#71717a';
  const gridColor = dark ? '#3f3f46' : '#e4e4e7';
  const tooltipStyle = {
    background: dark ? 'rgba(24,24,27,.95)' : 'rgba(255,255,255,.95)',
    border: `1px solid ${gridColor}`,
    borderRadius: '8px',
    fontSize: '12px',
  };

  const pKey  = state.showRealValues ? 'portfolioReal'    : 'portfolioNominal';
  const ctKey = state.showRealValues ? 'coastTargetReal'  : 'coastTargetNominal';
  const fiKey = state.showRealValues ? 'fiTargetReal'     : 'fiTargetNominal';

  const chartData = result.timeline.map(d => ({
    ...d,
    ageLabel: Math.round(d.age * 10) / 10,
  }));

  const maxFI = Math.max(...chartData.map(d => d[fiKey] || 0));
  const finalP = chartData.at(-1)?.[pKey] || 0;
  const yMax = finalP > maxFI * 2.5 ? maxFI * 2.5 : undefined;

  // Status banner
  const status = result.isCoastNow
    ? { title: 'Coast FIRE Achieved!', icon: '⚓',
        color: 'var(--color-brand-500)', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.04)',
        message: `You have ${fmt(state.currentPortfolio)} — above your Coast Number of ${fmt(result.coastNumber)}. No more contributions needed.` }
    : result.coastAchievedAge !== null
    ? { title: 'On Track to Coast', icon: '✓',
        color: 'var(--color-success)', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.04)',
        message: `Your planned contributions will hit the Coast FIRE milestone at age ${result.coastAchievedAge.toFixed(1)}.` }
    : { title: 'Contribution Gap', icon: '⚠',
        color: 'var(--color-danger)', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.04)',
        message: "Your planned savings won't reach the Coast FIRE target before your retirement age." };

  return (
    <main className="main">
      <div className="container">

        {/* Header */}
        <header className="page-header">
          <p className="page-header__eyebrow">Calculator</p>
          <h1 className="page-header__title">Coast FIRE</h1>
          <p className="page-header__subtitle">
            The amount you need invested today to reach financial independence by retirement age — without saving another dime.
          </p>
        </header>

        {/* Summary stats */}
        <div className="stats-row" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="card">
            <div className="stat">
              <span className="stat__label">FI Target</span>
              <span className="stat__value num">{fmtCompact(result.fiTarget)}</span>
              <span className="stat__sub">{(100 / state.swr).toFixed(1)}× expenses</span>
            </div>
          </div>
          <div className="card">
            <div className="stat">
              <span className="stat__label">Coast Number Today</span>
              <span className="stat__value num" style={{ color: 'var(--color-brand-500)' }}>{fmt(result.coastNumber)}</span>
              <span className="stat__sub">{result.isCoastNow ? 'Already coasting ⚓' : `Need ${fmt(result.coastNumber - state.currentPortfolio)} more`}</span>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid--coast-fire" style={{ marginBottom: 'var(--space-8)' }}>

          {/* ── Left: Inputs ──────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Assumptions card */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                Assumptions
              </h2>

              <InputGroup label={`Current Age — ${state.currentAge}`}>
                <input type="range" min="18" max="75" value={state.currentAge}
                  onChange={e => set('currentAge', Math.min(parseInt(e.target.value), state.retirementAge - 1))} />
              </InputGroup>

              <InputGroup label={`Retirement Age — ${state.retirementAge}`}>
                <input type="range" min="30" max="80" value={state.retirementAge}
                  onChange={e => set('retirementAge', Math.max(parseInt(e.target.value), state.currentAge + 1))} />
              </InputGroup>

              <InputGroup label="Current Invested Assets">
                <NumInput prefix="$" value={state.currentPortfolio}
                  onChange={v => set('currentPortfolio', v)} />
              </InputGroup>

              <InputGroup label="Annual Spend in Retirement">
                <NumInput prefix="$" value={state.annualSpending}
                  onChange={v => set('annualSpending', v)} />
              </InputGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <InputGroup label="Nom. Return">
                  <NumInput suffix="%" value={state.returnRate} step={0.1}
                    onChange={v => set('returnRate', v)} />
                </InputGroup>
                <InputGroup label="Inflation">
                  <NumInput suffix="%" value={state.inflationRate} step={0.1}
                    onChange={v => set('inflationRate', v)} />
                </InputGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Real Return (Nominal − Inflation):</span>
                <span className="num" style={{ fontWeight: 700,
                  color: realReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {realReturn.toFixed(1)}%
                </span>
              </div>

              <InputGroup label={`SWR — ${(100 / state.swr).toFixed(1)}× multiplier`}>
                <NumInput suffix="%" value={state.swr} step={0.1} min={0.1}
                  onChange={v => set('swr', v)} />
              </InputGroup>
            </div>

            {/* Contributions card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Contributions</h2>
                <button className="btn btn--ghost btn--sm" onClick={addPeriod}>+ Add Phase</button>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
                Plan different savings rates over time. Phases run sequentially from today.
              </p>

              {state.periods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0',
                  border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  <p style={{ fontWeight: 500 }}>No contribution plan.</p>
                  <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>Growth relies entirely on current assets.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {state.periods.map((p, i) => (
                    <PeriodCard key={p.id} period={p} index={i}
                      onChange={updatePeriod} onRemove={removePeriod} />
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Duration:</span>
                <span className="num" style={{ fontWeight: 700,
                  color: overBudget ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                  {Math.floor(totalMonths / 12)} Yrs, {totalMonths % 12} Mos
                  {overBudget && ' ⚠'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Results ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Status banner */}
            <div className="card" style={{ borderColor: status.border, background: status.bg }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{status.icon}</span>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--text-xl)', color: status.color }}>
                    {status.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                    marginTop: 'var(--space-1)', lineHeight: 'var(--leading-relaxed)' }}>
                    {status.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card" style={{ minHeight: 360 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Trajectory</h2>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  {[["Today's $ (Real)", true], ["Future $ (Nominal)", false]].map(([label, real]) => (
                    <button key={label}
                      className={state.showRealValues === real ? 'btn btn--primary btn--sm' : 'btn btn--ghost btn--sm'}
                      onClick={() => set('showRealValues', real)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="ageLabel" tick={{ fill: textColor, fontSize: 11 }}
                    tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={fmtCompact} tick={{ fill: textColor, fontSize: 11 }}
                    tickLine={false} axisLine={false} width={58}
                    domain={yMax ? [0, yMax] : ['auto', 'auto']} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={l => `Age ${l}`}
                    formatter={(val, name) => [fmt(val), name]}
                    itemStyle={{ color: dark ? '#e4e4e7' : '#3f3f46' }}
                    labelStyle={{ color: dark ? '#fafafa' : '#18181b', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey={pKey} name="Your Portfolio"
                    stroke="#3b82f6" fill="rgba(59,130,246,0.08)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey={ctKey} name="Coast Target"
                    stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={fiKey} name="FI Number"
                    stroke={textColor} strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)',
                fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
                <LegendDot color="#3b82f6" label="Portfolio" />
                <LegendDot color="#f59e0b" label="Coast Target" dashed />
                <LegendDot color={textColor} label="FI Number" />
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid--2">
              <div className="card" style={{ background: 'var(--bg-subtle)' }}>
                <h4 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                  What is Coast FIRE?
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
                  The point where your investments are large enough that compound interest alone will grow them to your full FI number by retirement.
                </p>
              </div>
              <div className="card" style={{ background: 'var(--bg-subtle)' }}>
                <h4 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                  How is it calculated?
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
                  We use your SWR and annual spend to find your FI Target, then discount it back to today using the real return rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
