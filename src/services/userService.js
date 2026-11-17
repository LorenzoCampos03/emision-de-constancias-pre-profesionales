// userService.js

const API_BASE_URL = 'https://5000-firebase-certipro-backend-1749217674657.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/api';

// Función para obtener el token de autenticación desde localStorage
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Función para crear headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Función para crear headers para FormData con autenticación
const getAuthHeadersForFormData = () => {
  const token = getAuthToken()
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const userService = {
  // Obtener estudiantes (usuarios con rol estudiante)
  getStudents: async (includeDeleted = false) => {
    try {
      const url = `${API_BASE_URL}/users/role?role=ESTUDIANTE${includeDeleted ? '&include_deleted=true' : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Crear estudiante
  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(studentData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Actualizar estudiante completamente
  updateStudent: async (userId, updateData) => {
    try {
      // Elimina el ID si existe en los datos a actualizar
      const { id, ...cleanData } = updateData;
      const response = await fetch(`${API_BASE_URL}/users/${userId}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Eliminar estudiante (eliminado lógico)
  deleteStudent: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Reactivar estudiante
  reactivateStudent: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/restore`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error reactivating student:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios (con opción de incluir eliminados)
  getAllUsers: async (includeDeleted = false) => {
    try {
      const url = includeDeleted 
        ? `${API_BASE_URL}/users/list?include_deleted=true`
        : `${API_BASE_URL}/users/list`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtener usuarios eliminados
  getDeletedUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/deleted`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      throw error;
    }
  },

  // Cambiar contraseña de usuario
  changeUserPassword: async (userId, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ new_password: newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Obtener usuarios por periodo
  getUsersByPeriod: async (periodoId, includeDeleted = false) => {
    try {
      const url = includeDeleted 
        ? `${API_BASE_URL}/users/periodo/${periodoId}?include_deleted=true`
        : `${API_BASE_URL}/users/periodo/${periodoId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users by period:', error);
      throw error;
    }
  },

  // Carga masiva de usuarios
  bulkUploadUsers: async (file, periodoId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('periodo_id', periodoId);
      const response = await fetch(`${API_BASE_URL}/users/bulk-upload`, {
        method: 'POST',
        headers: getAuthHeadersForFormData(), // Usar headers especiales para FormData
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error uploading users:', error);
      throw error;
    }
  },

  // Obtener estadísticas de usuarios por estado
  getUsersStatsByStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats/estado`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }
};

export default userService;