import { useState, useEffect } from 'react';
import { api } from '../../services/api'; // <-- Importe a sua API

export default function Dashboard() {
  const [mensagem, setMensagem] = useState('Carregando...');

  useEffect(() => {
    api.getHello()
      .then(data => setMensagem(data.message))
      .catch(() => setMensagem('Falha ao conectar.'));
  }, []);

  return (
    <div>
      <h2>Seu Painel Financeiro 📊</h2>
      <p>Status do Backend: <strong>{mensagem}</strong></p>
    </div>
  );
}