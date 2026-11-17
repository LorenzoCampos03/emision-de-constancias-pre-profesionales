// solicitudesService.js

const API_BASE_URL = 'https://5000-firebase-certipro-backend-1749217674657.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/api'; // Ajusta según tu configuración

// Función para obtener el token del localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Función para hacer peticiones autenticadas
const apiRequest = async (endpoint, options = {}) => {
  const API_BASE_URL = 'https://5000-firebase-certipro-backend-1749217674657.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/api';
  const token = getToken();
  console.log('🔐 Token usado en la petición:', token);

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // importante si usas cookies
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log("📡 Haciendo petición a:", fullUrl);
  console.log("📦 Configuración enviada:", config);

  try {
    const response = await fetch(fullUrl, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('❌ Error en la respuesta:', errorData);
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta recibida:', data);
    return data;
  } catch (err) {
    console.error('🚨 Error en apiRequest:', err);
    throw err;
  }
};

// Servicios para Solicitudes
export const solicitudesService = {
  // Obtener todas las solicitudes
  getAllSolicitudes: async (includeDeleted = false) => {
    return apiRequest(`/solicitudes?include_deleted=${includeDeleted}`);
  },

  // Obtener solicitudes por usuario
  getSolicitudesByUser: async (userId, includeDeleted = false) => {
    return apiRequest(`/solicitudes/user/${userId}?include_deleted=${includeDeleted}`);
  },

  // Obtener solicitudes pendientes
  getSolicitudesPendientes: async () => {
    return apiRequest('/solicitudes/pendientes');
  },

  // Obtener solicitudes aceptadas
  getSolicitudesAceptadas: async () => {
    return apiRequest('/solicitudes/aceptadas');
  },

  // Obtener solicitudes rechazadas
  getSolicitudesRechazadas: async () => {
    return apiRequest('/solicitudes/rechazadas');
  },

  // Crear nueva solicitud
  createSolicitud: async (data) => {
    return apiRequest('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Aceptar solicitud
  aceptarSolicitud: async (solicitudId) => {
    return apiRequest(`/solicitudes/${solicitudId}/aceptar`, {
      method: 'PATCH',
    });
  },

  // Rechazar solicitud
  rechazarSolicitud: async (solicitudId, motivo) => {
    return apiRequest(`/solicitudes/${solicitudId}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
  },

  // Obtener detalle completo de solicitud
  getSolicitudDetalle: async (solicitudId) => {
    console.log("📩 Llamando getSolicitudDetalle con ID:", solicitudId);
    return apiRequest(`/solicitudes/${solicitudId}/detalle`);
  },

  // Actualizar motivo de rechazo
  updateMotivoRechazo: async (solicitudId, nuevoMotivo) => {
    return apiRequest(`/solicitudes/${solicitudId}/motivo`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo: nuevoMotivo }),
    });
  },

  // 🆕 FUNCIÓN UNIFICADA para verificar cambios (para notificaciones)
  checkForChanges: async (userId, userType, lastCheck = null) => {
    const params = lastCheck ? `?last_check=${encodeURIComponent(lastCheck)}` : '';
    
    if (userType === 'SECRETARIA') {
      return apiRequest(`/solicitudes/secretaria/changes${params}`);
    } else if (userType === 'ESTUDIANTE') {
      return apiRequest(`/solicitudes/user/${userId}/changes${params}`);
    } else {
      throw new Error('Tipo de usuario no válido');
    }
  },

  // Verificar cambios para usuario específico
  checkUserChanges: async (userId, lastCheck = null) => {
    const params = lastCheck ? `?last_check=${encodeURIComponent(lastCheck)}` : '';
    return apiRequest(`/solicitudes/user/${userId}/changes${params}`);
  },

  // Verificar nuevas solicitudes para secretaria
  checkSecretariaChanges: async (lastCheck = null) => {
    const params = lastCheck ? `?last_check=${encodeURIComponent(lastCheck)}` : '';
    return apiRequest(`/solicitudes/secretaria/changes${params}`);
  },

  // Obtener resumen de notificaciones para el usuario
  getUserNotificationSummary: async (userId) => {
    return apiRequest(`/solicitudes/user/${userId}/summary`);
  },
};

// Función para calcular estadísticas
export const calcularEstadisticas = (solicitudes) => {
  const stats = {
    total: solicitudes.length,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
  };

  solicitudes.forEach(solicitud => {
    switch (solicitud.estado) {
      case 'pendiente':
        stats.pendientes++;
        break;
      case 'aceptado':
        stats.aprobadas++;
        break;
      case 'rechazado':
        stats.rechazadas++;
        break;
    }
  });

  return stats;
};