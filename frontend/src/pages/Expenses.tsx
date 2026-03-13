import { useState, useEffect, type FormEvent } from 'react';
import { api } from '@/services/api';
import type { Expense, ExpenseCategory } from '@/types';
import './Pages.scss';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState<'fixed' | 'variable'>('fixed');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  const loadData = async () => {
    try {
      const [expData, catData] = await Promise.all([
        api.getExpenses(filterType || undefined),
        api.getCategories(),
      ]);
      setExpenses(expData);
      setCategories(catData);
    } catch {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterType]);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.createCategory(newCategory.trim());
      setNewCategory('');
      await loadData();
    } catch {
      console.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      await loadData();
    } catch {
      console.error('Failed to delete category');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !categoryId) return;
    try {
      await api.createExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        expense_type: expenseType,
        category_id: parseInt(categoryId),
        date,
      });
      setDescription('');
      setAmount('');
      await loadData();
    } catch {
      console.error('Failed to create expense');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteExpense(id);
      await loadData();
    } catch {
      console.error('Failed to delete expense');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="page-container">
      <h2>Despesas</h2>

      <div className="form-card">
        <h3>Categorias</h3>
        <form className="form-row" onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="Nova categoria"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
          />
          <button type="submit">Adicionar</button>
        </form>
        {categories.length > 0 && (
          <div className="tags">
            {categories.map(cat => (
              <span key={cat.id} className="tag">
                {cat.name}
                <button className="tag-remove" onClick={() => handleDeleteCategory(cat.id)}>x</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Nova Despesa</h3>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Descricao"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valor (R$)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <select value={expenseType} onChange={e => setExpenseType(e.target.value as 'fixed' | 'variable')}>
            <option value="fixed">Fixa</option>
            <option value="variable">Variavel</option>
          </select>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            <option value="">Selecione categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <button type="submit">Adicionar</button>
        </div>
      </form>

      <div className="list-card">
        <div className="list-header">
          <h3>Suas Despesas</h3>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todas</option>
            <option value="fixed">Fixas</option>
            <option value="variable">Variaveis</option>
          </select>
        </div>
        {expenses.length === 0 ? (
          <p className="empty-state">Nenhuma despesa cadastrada.</p>
        ) : (
          <ul className="item-list">
            {expenses.map(exp => (
              <li key={exp.id} className="item-row expense-row">
                <div className="expense-info">
                  <strong>{exp.description}</strong>
                  <span className="expense-meta">
                    {exp.category.name} | {exp.expense_type === 'fixed' ? 'Fixa' : 'Variavel'} | {exp.date}
                  </span>
                </div>
                <span className="expense-amount">R$ {exp.amount.toFixed(2)}</span>
                <button className="btn-delete" onClick={() => handleDelete(exp.id)}>Remover</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
