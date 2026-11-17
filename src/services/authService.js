const API_URL = 'https://5000-firebase-certipro-backend-1749217674657.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/api/auth'; // Cambia si usas otro host o puerto

// Login
export async function login({ username, password }) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return data; // { token, user, message }
}

// Logout (solo borra del cliente)
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Validar token (opcional si lo deseas usar en el contexto)
export async function validateToken(token) {
  const response = await fetch(`${API_URL}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });

  const data = await response.json();
  return data;
}
