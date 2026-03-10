
const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  getHello: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/hello`);
      if (!response.ok) throw new Error('Erro na rede');
      return await response.json();
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },
  
};