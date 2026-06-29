const API_URL = 'http://192.168.1.50:3000/api'; // Ajusta la IP según la laptop

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error('Error en GET ' + endpoint);
    return response.json();
  },
  
  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Error en POST ' + endpoint);
    return response.json();
  },

  put: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Error en PUT ' + endpoint);
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error en DELETE ' + endpoint);
    return response.json();
  },

  postForm: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Error en POST form ' + endpoint);
    return response.json();
  }
};
