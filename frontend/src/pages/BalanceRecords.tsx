import { useState, useEffect, type FormEvent } from 'react';
import { api } from '@/services/api';
import type { Bank, BalanceRecord } from '@/types';
import './Pages.scss';

export default function BalanceRecords() {
  const [records, setRecords] = useState<BalanceRecord[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankId, setBankId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [accountBalance, setAccountBalance] = useState('');
  const [creditCardCurrent, setCreditCardCurrent] = useState('');
  const [creditCardMonth1, setCreditCardMonth1] = useState('');
  const [creditCardMonth2, setCreditCardMonth2] = useState('');
  const [creditCardMonth3, setCreditCardMonth3] = useState('');
  const [creditCardMonth4, setCreditCardMonth4] = useState('');
  const [creditCardMonth5, setCreditCardMonth5] = useState('');
  const [creditCardMonth6, setCreditCardMonth6] = useState('');
  const [investments, setInvestments] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterBank, setFilterBank] = useState('');

  const loadData = async () => {
    try {
      const bankFilter = filterBank ? parseInt(filterBank) : undefined;
      const [recData, bankData] = await Promise.all([
        api.getBalanceRecords(bankFilter),
        api.getBanks(),
      ]);
      setRecords(recData);
      setBanks(bankData);
    } catch {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterBank]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bankId) return;
    try {
      await api.createBalanceRecord({
        bank_id: parseInt(bankId),
        date,
        account_balance: parseFloat(accountBalance) || 0,
        credit_card_current: parseFloat(creditCardCurrent) || 0,
        credit_card_month_1: parseFloat(creditCardMonth1) || 0,
        credit_card_month_2: parseFloat(creditCardMonth2) || 0,
        credit_card_month_3: parseFloat(creditCardMonth3) || 0,
        credit_card_month_4: parseFloat(creditCardMonth4) || 0,
        credit_card_month_5: parseFloat(creditCardMonth5) || 0,
        credit_card_month_6: parseFloat(creditCardMonth6) || 0,
        investments: parseFloat(investments) || 0,
      });
      setAccountBalance('');
      setCreditCardCurrent('');
      setCreditCardMonth1('');
      setCreditCardMonth2('');
      setCreditCardMonth3('');
      setCreditCardMonth4('');
      setCreditCardMonth5('');
      setCreditCardMonth6('');
      setInvestments('');
      await loadData();
    } catch {
      console.error('Failed to create balance record');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteBalanceRecord(id);
      await loadData();
    } catch {
      console.error('Failed to delete record');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="page-container">
      <h2>Registro de Saldos</h2>

      {banks.length === 0 ? (
        <div className="form-card">
          <p className="empty-state">Cadastre um banco primeiro na pagina de Bancos.</p>
        </div>
      ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Novo Registro</h3>
          <div className="form-grid">
            <select value={bankId} onChange={e => setBankId(e.target.value)} required>
              <option value="">Selecione o banco</option>
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="form-section">
            <h4>Saldo em Conta</h4>
            <input
              type="number"
              step="0.01"
              placeholder="Valor em conta (R$)"
              value={accountBalance}
              onChange={e => setAccountBalance(e.target.value)}
            />
          </div>

          <div className="form-section">
            <h4>Fatura do Cartao de Credito</h4>
            <div className="form-grid">
              <div className="input-group">
                <label>Mes atual</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardCurrent} onChange={e => setCreditCardCurrent(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +1</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth1} onChange={e => setCreditCardMonth1(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +2</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth2} onChange={e => setCreditCardMonth2(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +3</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth3} onChange={e => setCreditCardMonth3(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +4</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth4} onChange={e => setCreditCardMonth4(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +5</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth5} onChange={e => setCreditCardMonth5(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mes +6</label>
                <input type="number" step="0.01" placeholder="R$" value={creditCardMonth6} onChange={e => setCreditCardMonth6(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Investimentos</h4>
            <input
              type="number"
              step="0.01"
              placeholder="Valor investido (R$)"
              value={investments}
              onChange={e => setInvestments(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">Salvar Registro</button>
        </form>
      )}

      <div className="list-card">
        <div className="list-header">
          <h3>Historico</h3>
          <select className="filter-select" value={filterBank} onChange={e => setFilterBank(e.target.value)}>
            <option value="">Todos os bancos</option>
            {banks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        {records.length === 0 ? (
          <p className="empty-state">Nenhum registro encontrado.</p>
        ) : (
          <ul className="item-list">
            {records.map(rec => (
              <li key={rec.id} className="item-row record-row">
                <div className="record-info">
                  <strong>{rec.bank.name}</strong>
                  <span className="record-date">{rec.date}</span>
                </div>
                <div className="record-values">
                  <span>Conta: R$ {rec.account_balance.toFixed(2)}</span>
                  <span>Fatura: R$ {rec.credit_card_current.toFixed(2)}</span>
                  <span>Investido: R$ {rec.investments.toFixed(2)}</span>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(rec.id)}>Remover</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
