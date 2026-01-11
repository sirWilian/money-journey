import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/chart-data')
      .then(res => setData(res.data))
      .catch(err => console.error("Erro na API:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Money Journey 📈</h1>
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;