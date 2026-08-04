import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { api } from '@/services/api';
import type { BalanceRecord, Expense } from '@/types';
import './Pages.scss';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

interface AccountChartData {
  date: string;
  balance: number;
  bank: string;
}

interface CreditCardChartData {
  month: string;
  amount: number;
}

interface InvestmentChartData {
  date: string;
  amount: number;
  bank: string;
}

interface ExpenseChartData {
  name: string;
  value: number;
}

interface ProjectionPoint {
  month: number;
  label: string;
  value: number;
}

interface InvestmentPreset {
  name: string;
  annualRate: number;
  description: string;
}

const INVESTMENT_PRESETS: InvestmentPreset[] = [
  { name: 'Poupanca', annualRate: 6.17, description: '~6.17% a.a.' },
  { name: 'CDB 100% CDI', annualRate: 13.25, description: '~13.25% a.a.' },
  { name: 'CDB 120% CDI', annualRate: 15.90, description: '~15.90% a.a.' },
  { name: 'LCI/LCA 90% CDI', annualRate: 11.93, description: '~11.93% a.a. (isento IR)' },
  { name: 'LCI/LCA 95% CDI', annualRate: 12.59, description: '~12.59% a.a. (isento IR)' },
  { name: 'Tesouro Selic', annualRate: 13.25, description: '~13.25% a.a.' },
  { name: 'Tesouro IPCA+', annualRate: 10.50, description: '~IPCA + 6% a.a.' },
  { name: 'Tesouro Prefixado', annualRate: 14.50, description: '~14.50% a.a.' },
  { name: 'Personalizado', annualRate: 0, description: 'Defina sua taxa' },
];

function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const startStr = threeMonthsAgo.toISOString().split('T')[0] ?? '';
  const endStr = now.toISOString().split('T')[0] ?? '';
  return { start: startStr, end: endStr };
}

function computeProjection(
  principal: number,
  annualRate: number,
  months: number,
): ProjectionPoint[] {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const points: ProjectionPoint[] = [];
  for (let m = 0; m <= months; m++) {
    const value = principal * Math.pow(1 + monthlyRate, m);
    points.push({
      month: m,
      label: m === 0 ? 'Hoje' : `Mes ${m}`,
      value: Math.round(value * 100) / 100,
    });
  }
  return points;
}

// TODO: add summary cards (total balance, total investments, total expenses)
// TODO: add multi-bank comparison chart
// TODO: add monthly expense trend line
// TODO: add export to CSV/PDF
// TODO: add currency toggle (BRL / USD)
export default function Dashboard() {
  const [records, setRecords] = useState<BalanceRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [dateStart, setDateStart] = useState(defaultRange.start);
  const [dateEnd, setDateEnd] = useState(defaultRange.end);

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customRate, setCustomRate] = useState('');
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [projectionPrincipal, setProjectionPrincipal] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recData, expData] = await Promise.all([
          api.getBalanceRecords(),
          api.getExpenses(),
        ]);
        setRecords(recData);
        setExpenses(expData);
      } catch {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (dateStart && r.date < dateStart) return false;
      if (dateEnd && r.date > dateEnd) return false;
      return true;
    });
  }, [records, dateStart, dateEnd]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (dateStart && e.date < dateStart) return false;
      if (dateEnd && e.date > dateEnd) return false;
      return true;
    });
  }, [expenses, dateStart, dateEnd]);

  const activeRate = useMemo(() => {
    const preset = INVESTMENT_PRESETS[selectedPreset];
    if (!preset) return 0;
    if (preset.name === 'Personalizado') {
      return parseFloat(customRate) || 0;
    }
    return preset.annualRate;
  }, [selectedPreset, customRate]);

  const principalValue = useMemo(() => {
    if (projectionPrincipal) return parseFloat(projectionPrincipal) || 0;
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.length > 0 && sorted[0] ? sorted[0].investments : 0;
  }, [projectionPrincipal, records]);

  const projectionData = useMemo(() => {
    if (principalValue <= 0 || activeRate <= 0) return [];
    return computeProjection(principalValue, activeRate, projectionMonths);
  }, [principalValue, activeRate, projectionMonths]);

  if (loading) return <div className="loading">Carregando...</div>;

  const hasData = records.length > 0 || expenses.length > 0;

  if (!hasData) {
    return (
      <div className="page-container">
        <h2>Dashboard</h2>
        <div className="form-card">
          <p className="empty-state">
            Cadastre bancos, registre saldos e despesas para visualizar os graficos.
          </p>
        </div>
      </div>
    );
  }

  const accountData: AccountChartData[] = [...filteredRecords]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      date: r.date,
      balance: r.account_balance,
      bank: r.bank.name,
    }));

  const latestRecord = filteredRecords.length > 0
    ? [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const creditCardData: CreditCardChartData[] = latestRecord ? [
    { month: 'Atual', amount: latestRecord.credit_card_current },
    { month: 'Mes +1', amount: latestRecord.credit_card_month_1 },
    { month: 'Mes +2', amount: latestRecord.credit_card_month_2 },
    { month: 'Mes +3', amount: latestRecord.credit_card_month_3 },
    { month: 'Mes +4', amount: latestRecord.credit_card_month_4 },
    { month: 'Mes +5', amount: latestRecord.credit_card_month_5 },
    { month: 'Mes +6', amount: latestRecord.credit_card_month_6 },
  ] : [];

  const investmentData: InvestmentChartData[] = [...filteredRecords]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      date: r.date,
      amount: r.investments,
      bank: r.bank.name,
    }));

  const expenseByCategory = filteredExpenses.reduce<Record<string, number>>((acc, exp) => {
    const key = exp.category.name;
    acc[key] = (acc[key] || 0) + exp.amount;
    return acc;
  }, {});

  const expenseChartData: ExpenseChartData[] = Object.entries(expenseByCategory).map(
    ([name, value]) => ({ name, value })
  );

  const selectedPresetObj = INVESTMENT_PRESETS[selectedPreset];

  const projectionGain = projectionData.length > 0
    ? (projectionData[projectionData.length - 1]?.value ?? 0) - principalValue
    : 0;

  return (
    <div className="page-container">
      <h2>Dashboard</h2>

      <div className="form-card period-filter">
        <h3>Periodo</h3>
        <div className="form-row">
          <div className="input-group">
            <label>De</label>
            <input
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Ate</label>
            <input
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDateStart('');
              setDateEnd('');
            }}
          >
            Limpar filtro
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {accountData.length > 0 && (
          <div className="chart-card">
            <h3>Saldo em Conta</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="balance" name="Saldo" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {creditCardData.length > 0 && (
          <div className="chart-card">
            <h3>Fatura Cartao de Credito</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditCardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Bar dataKey="amount" name="Fatura" fill="#E91E63" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {investmentData.length > 0 && (
          <div className="chart-card">
            <h3>Investimentos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Investido" stroke="#2196F3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {expenseChartData.length > 0 && (
          <div className="chart-card">
            <h3>Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {expenseChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="projection-section">
        <h2>Projecao de Investimentos</h2>

        <div className="form-card">
          <h3>Configurar Projecao</h3>

          <div className="projection-config">
            <div className="input-group">
              <label>Valor investido (R$)</label>
              <input
                type="number"
                placeholder={principalValue > 0 ? `Ultimo registro: R$ ${principalValue.toFixed(2)}` : 'Valor inicial'}
                value={projectionPrincipal}
                onChange={e => setProjectionPrincipal(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Horizonte (meses)</label>
              <select
                value={projectionMonths}
                onChange={e => setProjectionMonths(Number(e.target.value))}
              >
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
                <option value={36}>36 meses</option>
                <option value={60}>60 meses</option>
              </select>
            </div>

            <div className="input-group">
              <label>Tipo de investimento</label>
              <select
                value={selectedPreset}
                onChange={e => setSelectedPreset(Number(e.target.value))}
              >
                {INVESTMENT_PRESETS.map((preset, idx) => (
                  <option key={preset.name} value={idx}>
                    {preset.name} ({preset.description})
                  </option>
                ))}
              </select>
            </div>

            {selectedPresetObj?.name === 'Personalizado' && (
              <div className="input-group">
                <label>Taxa anual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 12.50"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                />
              </div>
            )}
          </div>

          {activeRate > 0 && (
            <div className="projection-summary">
              <span className="summary-item">
                Taxa: <strong>{activeRate.toFixed(2)}% a.a.</strong>
              </span>
              <span className="summary-item">
                Taxa mensal: <strong>{((Math.pow(1 + activeRate / 100, 1 / 12) - 1) * 100).toFixed(4)}%</strong>
              </span>
              {projectionData.length > 0 && (
                <>
                  <span className="summary-item">
                    Valor final: <strong>R$ {(projectionData[projectionData.length - 1]?.value ?? 0).toFixed(2)}</strong>
                  </span>
                  <span className="summary-item gain">
                    Ganho: <strong>R$ {projectionGain.toFixed(2)}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {projectionData.length > 0 && (
          <div className="chart-card">
            <h3>
              Projecao: {selectedPresetObj?.name ?? 'Personalizado'} &mdash; {projectionMonths} meses
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Valor Projetado"
                  stroke="#2196F3"
                  fillOpacity={1}
                  fill="url(#projGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {projectionData.length === 0 && principalValue <= 0 && (
          <div className="form-card">
            <p className="empty-state">
              Insira um valor investido ou registre saldos para ver a projecao.
            </p>
          </div>
        )}

        {projectionData.length === 0 && principalValue > 0 && activeRate <= 0 && (
          <div className="form-card">
            <p className="empty-state">
              Selecione um tipo de investimento ou insira uma taxa personalizada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
