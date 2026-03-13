import { useState, useEffect, type FormEvent } from 'react';
import { api } from '@/services/api';
import type { Bank } from '@/types';
import './Pages.scss';

export default function Banks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [loading, setLoading] = useState(true);

  const loadBanks = async () => {
    try {
      const data = await api.getBanks();
      setBanks(data);
    } catch {
      console.error('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanks(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createBank({ name: name.trim(), color });
      setName('');
      setColor('#4CAF50');
      await loadBanks();
    } catch {
      console.error('Failed to create bank');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteBank(id);
      await loadBanks();
    } catch {
      console.error('Failed to delete bank');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="page-container">
      <h2>Bancos</h2>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Adicionar Banco</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nome do banco"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            title="Cor do banco"
          />
          <button type="submit">Adicionar</button>
        </div>
      </form>

      <div className="list-card">
        <h3>Seus Bancos</h3>
        {banks.length === 0 ? (
          <p className="empty-state">Nenhum banco cadastrado.</p>
        ) : (
          <ul className="item-list">
            {banks.map(bank => (
              <li key={bank.id} className="item-row">
                <span className="color-dot" style={{ backgroundColor: bank.color }} />
                <span className="item-name">{bank.name}</span>
                <button className="btn-delete" onClick={() => handleDelete(bank.id)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
