const API_BASE_URL =
  "https://5000-firebase-certipro-backend-1749217674657.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev/api"

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

class ConstanciaService {
  // ========== MÉTODOS EXISTENTES ==========

  // Obtener todas las constancias (activas por defecto) - MEJORADO
  async getAllConstancias(includeDeleted = true) {
    try {
      console.log("🔍 Obteniendo todas las constancias")

      const url = includeDeleted ? `${API_BASE_URL}/constancias?include_deleted=true` : `${API_BASE_URL}/constancias`

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Constancias obtenidas:", data)

      // Retornar las constancias con la estructura correcta
      return data.constancias || data.data || data
    } catch (error) {
      console.error("❌ Error en getAllConstancias:", error)
      throw error
    }
  }

  // Obtener constancias eliminadas lógicamente
  async getDeletedConstancias() {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias/deleted`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener constancias eliminadas")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Obtener constancias por status (simulado con los endpoints existentes)
  async getConstanciasByStatus(status) {
    try {
      if (status === "I") {
        // Para constancias inactivas, usar el endpoint de eliminadas
        return await this.getDeletedConstancias()
      } else {
        // Para constancias activas, usar el endpoint normal
        return await this.getAllConstancias(false)
      }
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Obtener constancia por ID
  async getConstanciaById(id, includeDeleted = false) {
    try {
      const url = includeDeleted
        ? `${API_BASE_URL}/constancias/${id}?include_deleted=true`
        : `${API_BASE_URL}/constancias/${id}`

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener constancia")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Obtener constancias por solicitud ID - MEJORADO
  async getConstanciasBySolicitud(solicitudId, includeDeleted = false) {
    try {
      const url = includeDeleted
        ? `${API_BASE_URL}/constancias/solicitud/${solicitudId}?include_deleted=true`
        : `${API_BASE_URL}/constancias/solicitud/${solicitudId}`

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener constancias por solicitud")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Obtener constancias por rango de fechas
  async getConstanciasByFechaRango(fechaInicio, fechaFin, includeDeleted = false) {
    try {
      const params = new URLSearchParams({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        ...(includeDeleted && { include_deleted: "true" }),
      })

      const response = await fetch(`${API_BASE_URL}/constancias/fecha-rango?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener constancias por rango de fechas")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Crear nueva constancia
  async createConstancia(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear constancia")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Actualizar constancia
  async updateConstancia(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar constancia")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Eliminar constancia (lógicamente)
  async deleteConstancia(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar constancia")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Restaurar constancia eliminada
  async restoreConstancia(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias/${id}/restore`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al restaurar constancia")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Cambiar status de constancia (wrapper para eliminar/restaurar)
  async toggleStatus(id, status) {
    try {
      if (status === "I") {
        return await this.deleteConstancia(id)
      } else if (status === "A") {
        return await this.restoreConstancia(id)
      } else {
        throw new Error('Status inválido. Use "A" para activo o "I" para inactivo')
      }
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // Actualizar ruta del archivo PDF
  async updatePdfPath(id, rutaArchivo) {
    try {
      const response = await fetch(`${API_BASE_URL}/constancias/${id}/pdf`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ruta_archivo_pdf: rutaArchivo }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar ruta del PDF")
      }

      return await response.json()
    } catch (error) {
      console.error("Error:", error)
      throw error
    }
  }

  // ========== MÉTODOS NUEVOS AGREGADOS ==========

  // Crear solicitud de constancia para estudiante - CORREGIDO
  async createConstanciaEstudiante(data) {
    try {
      console.log("🚀 Creando solicitud de constancia para estudiante")

      // Validar datos requeridos
      const requestData = {
        nombre_evento: data.nombre_evento,
        nombre_certificacion: data.nombre_certificacion,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        cantidad_horas: Number.parseInt(data.cantidad_horas),
        proyecto_nombre: data.proyecto_nombre,
        actividades: data.actividades,
        modulo_id: Number.parseInt(data.modulo_id) || 1, // Asegurar que sea entero
      }

      console.log("📦 Datos a enviar:", requestData)

      const response = await fetch(`${API_BASE_URL}/constancias/estudiante`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear solicitud de constancia")
      }

      const result = await response.json()
      console.log("✅ Solicitud creada:", result)
      return result
    } catch (error) {
      console.error("❌ Error en createConstanciaEstudiante:", error)
      throw error
    }
  }

  // Obtener constancia específica por solicitud_id - NUEVO MÉTODO PRINCIPAL
  async getConstanciaBySolicitudId(solicitudId) {
    try {
      console.log("🔍 Buscando constancia para solicitud_id:", solicitudId)

      const response = await fetch(`${API_BASE_URL}/constancias/solicitud/${solicitudId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log("⚠️ Constancia no encontrada para solicitud_id:", solicitudId)
          return null
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Constancia encontrada:", data)

      // La respuesta ya viene con la estructura correcta del backend corregido
      return data.constancia || data
    } catch (error) {
      console.error("❌ Error en getConstanciaBySolicitudId:", error)
      throw error
    }
  }

  // Obtener constancias de un usuario específico - NUEVO
  async getConstanciasByUser(userId) {
    try {
      console.log("🔍 Buscando constancias para usuario:", userId)

      const response = await fetch(`${API_BASE_URL}/constancias/usuario/${userId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Constancias del usuario:", data)

      return data.constancias || data.data || data
    } catch (error) {
      console.error("❌ Error en getConstanciasByUser:", error)
      throw error
    }
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  // Método para limpiar y validar datos de constancia
  limpiarDatosConstancia(data) {
    console.log("🧹 Limpiando datos de constancia:", data)

    // Si es un array, tomar el primer elemento válido
    if (Array.isArray(data)) {
      const elementosValidos = data.filter(
        (item) => item && typeof item === "object" && item.constancia_id && item.solicitud_id && item.nombre_evento,
      )
      return elementosValidos.length > 0 ? elementosValidos[0] : null
    }

    // Si es un objeto único, validar que sea válido
    if (data && typeof data === "object") {
      const esValido = data.constancia_id && data.solicitud_id && data.nombre_evento
      return esValido ? data : null
    }

    return null
  }

  // Método para buscar constancia con múltiples estrategias
  async buscarConstanciaCompleta(solicitudId, userId = null) {
    try {
      console.log("🔍 === BÚSQUEDA COMPLETA DE CONSTANCIA ===")
      console.log("📋 Solicitud ID:", solicitudId)
      console.log("👤 Usuario ID:", userId)

      // Estrategia 1: Buscar por solicitud_id específica
      try {
        console.log("🎯 Estrategia 1: Búsqueda específica por solicitud_id")
        const constancia = await this.getConstanciaBySolicitudId(solicitudId)

        if (constancia) {
          const constanciaLimpia = this.limpiarDatosConstancia(constancia)
          if (constanciaLimpia) {
            console.log("✅ Constancia encontrada con estrategia 1")
            return constanciaLimpia
          }
        }
      } catch (err) {
        console.log("⚠️ Estrategia 1 falló:", err.message)
      }

      // Estrategia 2: Buscar en todas las constancias
      try {
        console.log("🎯 Estrategia 2: Búsqueda en todas las constancias")
        const todasConstancias = await this.getAllConstancias(true)

        if (todasConstancias && todasConstancias.length > 0) {
          // Buscar por solicitud_id
          let constancia = todasConstancias.find(
            (c) => c.solicitud_id === solicitudId || c.solicitud_id === Number.parseInt(solicitudId),
          )

          if (constancia) {
            console.log("✅ Constancia encontrada con estrategia 2 (por solicitud_id)")
            return constancia
          }

          // Si hay userId, buscar por usuario
          if (userId) {
            constancia = todasConstancias.find((c) => c.user_id === userId || c.user_id === Number.parseInt(userId))

            if (constancia) {
              console.log("✅ Constancia encontrada con estrategia 2 (por user_id)")
              return constancia
            }
          }
        }
      } catch (err) {
        console.log("⚠️ Estrategia 2 falló:", err.message)
      }

      // Estrategia 3: Buscar por usuario si se proporciona
      if (userId) {
        try {
          console.log("🎯 Estrategia 3: Búsqueda por usuario")
          const constanciasUsuario = await this.getConstanciasByUser(userId)

          if (constanciasUsuario && constanciasUsuario.length > 0) {
            // Buscar la que coincida con la solicitud
            const constancia = constanciasUsuario.find(
              (c) => c.solicitud_id === solicitudId || c.solicitud_id === Number.parseInt(solicitudId),
            )

            if (constancia) {
              console.log("✅ Constancia encontrada con estrategia 3")
              return constancia
            }

            // Si no encuentra por solicitud_id, tomar la más reciente
            console.log("⚠️ Tomando constancia más reciente del usuario")
            return constanciasUsuario[0]
          }
        } catch (err) {
          console.log("⚠️ Estrategia 3 falló:", err.message)
        }
      }

      console.log("❌ No se encontró constancia con ninguna estrategia")
      return null
    } catch (error) {
      console.error("❌ Error en búsqueda completa:", error)
      throw error
    }
  }

  // ========== MÉTODOS DE DEBUG ==========

  // Método para debug sin autenticación
  async debugConstancia(solicitudId) {
    try {
      console.log("🔍 Debug de constancia para solicitud_id:", solicitudId)

      const response = await fetch(`${API_BASE_URL}/debug/simple-constancia/${solicitudId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }, // Sin token
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("🔍 Resultado del debug:", data)
      return data
    } catch (error) {
      console.error("❌ Error en debug:", error)
      throw error
    }
  }
}

export default new ConstanciaService()