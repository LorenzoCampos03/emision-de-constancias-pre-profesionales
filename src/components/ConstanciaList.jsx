"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, FileText, Users, Filter, Search } from "lucide-react"
import constanciaService from "../services/constanciaService"
import { useCallback } from "react"
import ConstanciaPreview from "./ConstanciaPreview"
import { solicitudesService } from "../services/solicitudesService"

// 🚀 FUNCIÓN MEJORADA - Mejor manejo de fechas
const formatearFecha = (fecha) => {
  if (!fecha || fecha === "None" || fecha === "null") return "Fecha no disponible"

  try {
    let date

    if (typeof fecha === "string") {
      // Si viene en formato DD/MM/YYYY (como "29/06/2025")
      if (fecha.includes("/") && !fecha.includes("T")) {
        const [day, month, year] = fecha.split("/")
        date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
      }
      // Si viene en formato ISO (2024-01-15T10:30:00.000Z)
      else if (fecha.includes("T")) {
        date = new Date(fecha)
      }
      // Si viene en formato YYYY-MM-DD
      else if (fecha.includes("-")) {
        date = new Date(fecha)
      }
      // Otros formatos
      else {
        date = new Date(fecha)
      }
    } else {
      date = new Date(fecha)
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn("Fecha inválida:", fecha)
      return "Fecha inválida"
    }

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formateando fecha:", error, "Fecha original:", fecha)
    return "Fecha inválida"
  }
}

const ConstanciaList = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedConstancia, setSelectedConstancia] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showRejected, setShowRejected] = useState(false)
  const [animationStage, setAnimationStage] = useState(0)

  // Estados para el preview - maneja múltiples solicitudes
  const [loadingConstancias, setLoadingConstancias] = useState({})

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroSemestre, setFiltroSemestre] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroCodigo, setFiltroCodigo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Animaciones escalonadas
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 100)
    const timer2 = setTimeout(() => setAnimationStage(2), 300)
    const timer3 = setTimeout(() => setAnimationStage(3), 500)
    const timer4 = setTimeout(() => setAnimationStage(4), 700)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  const getEstadoBadge = (estado) => {
    let color = ""
    const text = estado || "Desconocido"

    switch (estado?.toLowerCase()) {
      case "pendiente":
        color = "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm"
        break
      case "aceptado":
        color = "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm"
        break
      case "rechazado":
        color = "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200 shadow-sm"
        break
      default:
        color = "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border border-slate-200 shadow-sm"
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${color} hover:scale-105 transition-transform duration-200`}
      >
        {text}
      </span>
    )
  }

  // 🚀 CARGAR TODAS LAS SOLICITUDES (sin filtrar por usuario)
  const cargarTodasLasSolicitudes = useCallback(async () => {
    try {
      setLoading(true)
      // Usar getAllSolicitudes para traer TODAS las solicitudes de TODOS los usuarios
      const response = await solicitudesService.getAllSolicitudes(false)
      const solicitudesData = response.data || response

      console.log("🔍 TODAS LAS SOLICITUDES (SECRETARIA):", solicitudesData)

      // Filtrar solicitudes válidas (que no sean null/vacías)
      const solicitudesValidas = solicitudesData.filter(
        (solicitud) =>
          solicitud &&
          solicitud.solicitud_id !== null &&
          solicitud.user_id !== null &&
          solicitud.fecha_solicitud !== "None" &&
          solicitud.fecha_solicitud !== null,
      )

      const solicitudesOrdenadas = solicitudesValidas.sort(
        (a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud),
      )

      setSolicitudes(solicitudesOrdenadas)
      console.log("🔍 SOLICITUDES FINALES (SECRETARIA):", solicitudesOrdenadas)
      setError(null)
    } catch (err) {
      console.error("Error cargando solicitudes:", err)
      setError("Error al cargar las solicitudes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarTodasLasSolicitudes()
  }, [cargarTodasLasSolicitudes])

  // 🚀 FUNCIÓN DE PREVIEW - Igual que en la vista del alumno
  const handlePreview = async (solicitud) => {
    const solicitudId = solicitud.solicitud_id

    try {
      // Set loading individual para esta solicitud
      setLoadingConstancias((prev) => ({ ...prev, [solicitudId]: true }))
      setError("")

      console.log("🔍 === INICIO PREVIEW (SECRETARIA) ===")
      console.log("📋 Solicitud:", solicitud)

      const constancia = await constanciaService.buscarConstanciaCompleta(solicitud.solicitud_id, solicitud.user_id)

      if (constancia) {
        const constanciaCompleta = {
          ...constancia,
          nombre_usuario: constancia.nombre_usuario || `${solicitud.nombres} ${solicitud.apellidos}`,
          nombres: constancia.nombres || solicitud.nombres,
          apellidos: constancia.apellidos || solicitud.apellidos,
          numero_documento: constancia.numero_documento || solicitud.numero_documento,
          document_type: constancia.document_type || solicitud.document_type || "DNI",
        }

        console.log("✅ CONSTANCIA FINAL ENCONTRADA:", constanciaCompleta)
        setSelectedConstancia(constanciaCompleta)
        setShowPreview(true)
      } else {
        console.log("❌ No se encontró constancia")
        setError(`No se encontró la constancia asociada. Solicitud ID: ${solicitud.solicitud_id}`)

        try {
          console.log("🔍 Ejecutando debug automático...")
          const debugResult = await constanciaService.debugConstancia(solicitud.solicitud_id)
          console.log("🔍 Resultado debug:", debugResult)
        } catch (debugErr) {
          console.log("⚠️ Debug falló:", debugErr.message)
        }
      }
    } catch (err) {
      console.error("❌ Error en handlePreview:", err)
      setError("Error al cargar la constancia para preview")
    } finally {
      // Remove loading individual para esta solicitud
      setLoadingConstancias((prev) => {
        const newState = { ...prev }
        delete newState[solicitudId]
        return newState
      })
      console.log("🔍 === FIN PREVIEW (SECRETARIA) ===")
    }
  }

  const toggleView = () => {
    setShowRejected(!showRejected)
    setCurrentPage(1)
  }

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroSemestre("")
    setFiltroModulo("")
    setFiltroFecha("")
    setFiltroCodigo("")
    setCurrentPage(1)
  }

  // 🚀 FILTRAR SOLICITUDES CON MÚLTIPLES CRITERIOS
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    // Filtro base por estado (aceptado/rechazado)
    const matchesStatus = showRejected ? solicitud.estado === "rechazado" : solicitud.estado === "aceptado"

    // Filtro por término de búsqueda (nombre completo)
    const matchesSearch =
      searchTerm === "" ||
      `${solicitud.nombres || ""} ${solicitud.apellidos || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.solicitud_id.toString().includes(searchTerm.toLowerCase())

    // Filtro por código de alumno
    const matchesCodigo =
      filtroCodigo === "" ||
      (solicitud.codigo_alumno && solicitud.codigo_alumno.toLowerCase().includes(filtroCodigo.toLowerCase()))

    // Filtro por semestre
    const matchesSemestre =
      filtroSemestre === "" || (solicitud.semestre_actual && solicitud.semestre_actual.toString() === filtroSemestre)

    // Filtro por módulo
    const matchesModulo =
      filtroModulo === "" ||
      (solicitud.modulo_solicitado && solicitud.modulo_solicitado.toLowerCase().includes(filtroModulo.toLowerCase()))

    // Filtro por fecha
    const matchesFecha = (() => {
      if (!filtroFecha || filtroFecha === "todos") return true
      if (!solicitud.fecha_solicitud) return false

      const now = new Date()
      let fechaSolicitud

      try {
        if (solicitud.fecha_solicitud.includes("/")) {
          const [day, month, year] = solicitud.fecha_solicitud.split("/")
          fechaSolicitud = new Date(`${year}-${month}-${day}`)
        } else {
          fechaSolicitud = new Date(solicitud.fecha_solicitud)
        }

        switch (filtroFecha) {
          case "hoy":
            return fechaSolicitud.toDateString() === now.toDateString()
          case "semana":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return fechaSolicitud >= weekAgo
          case "mes":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return fechaSolicitud >= monthAgo
          default:
            return true
        }
      } catch {
        return false
      }
    })()

    return matchesStatus && matchesSearch && matchesCodigo && matchesSemestre && matchesModulo && matchesFecha
  })

  // Obtener opciones únicas para los filtros
  const semestreOptions = [...new Set(solicitudes.map((s) => s.semestre_actual).filter(Boolean))].sort()
  const moduloOptions = [...new Set(solicitudes.map((s) => s.modulo_solicitado).filter(Boolean))].sort()

  const totalPages = Math.ceil(filteredSolicitudes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSolicitudes = filteredSolicitudes.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-slate-700 animate-pulse">CertiPro</p>
            <p className="text-slate-500 animate-bounce">Cargando solicitudes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div
          className={`transform transition-all duration-1000 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
            {/* Patrón de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-700/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Gestión de Constancias
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-lg">
                      Administra todas las solicitudes de constancias de los estudiantes
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`transform transition-all duration-1000 delay-100 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={cargarTodasLasSolicitudes}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros de Búsqueda Avanzados */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
            {/* Barra de búsqueda principal */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o ID de solicitud..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center px-4 sm:px-6 py-3 border-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105 ${
                  showFilters
                    ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500"
                    : "text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border-slate-200 hover:from-slate-200 hover:to-gray-200"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filtros Avanzados</span>
                <span className="sm:hidden">Filtros</span>
              </button>
            </div>

            {/* Filtros avanzados expandibles */}
            {showFilters && (
              <div className="border-t-2 border-slate-200 pt-6 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filtros Avanzados
                  </h3>
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-slate-500 to-gray-600 text-white font-bold rounded-lg hover:from-slate-600 hover:to-gray-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Limpiar Todo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Filtro por Código */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Código de Estudiante</label>
                    <input
                      type="text"
                      placeholder="Buscar por código..."
                      value={filtroCodigo}
                      onChange={(e) => {
                        setFiltroCodigo(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    />
                  </div>

                  {/* Filtro por Semestre */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Semestre</label>
                    <select
                      value={filtroSemestre}
                      onChange={(e) => {
                        setFiltroSemestre(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todos los semestres</option>
                      {semestreOptions.map((semestre) => (
                        <option key={semestre} value={semestre}>
                          Semestre {semestre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Módulo */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Módulo</label>
                    <select
                      value={filtroModulo}
                      onChange={(e) => {
                        setFiltroModulo(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todos los módulos</option>
                      {moduloOptions.map((modulo) => (
                        <option key={modulo} value={modulo}>
                          {modulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Fecha */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Solicitud</label>
                    <select
                      value={filtroFecha}
                      onChange={(e) => {
                        setFiltroFecha(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todas las fechas</option>
                      <option value="hoy">Hoy</option>
                      <option value="semana">Última semana</option>
                      <option value="mes">Último mes</option>
                    </select>
                  </div>
                </div>

                {/* Indicador de filtros activos */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                      Búsqueda: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-blue-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroCodigo && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                      Código: {filtroCodigo}
                      <button onClick={() => setFiltroCodigo("")} className="ml-2 hover:text-green-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroSemestre && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200">
                      Semestre: {filtroSemestre}
                      <button onClick={() => setFiltroSemestre("")} className="ml-2 hover:text-purple-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroModulo && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200">
                      Módulo: {filtroModulo}
                      <button onClick={() => setFiltroModulo("")} className="ml-2 hover:text-amber-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroFecha && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200">
                      Fecha: {filtroFecha}
                      <button onClick={() => setFiltroFecha("")} className="ml-2 hover:text-rose-900">
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles y Filtros de Estado */}
        <div
          className={`transform transition-all duration-1000 delay-250 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full text-white">
                  <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Filtros de Estado</h3>
                  <p className="text-slate-600 text-sm">Selecciona el tipo de solicitudes a mostrar</p>
                </div>
              </div>

              <button
                onClick={toggleView}
                className={`px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center space-x-2 sm:space-x-3 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  showRejected
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                }`}
              >
                {showRejected ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-sm sm:text-base">{showRejected ? "Ver Aceptadas" : "Ver Rechazadas"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de resultados */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div
            className={`rounded-xl p-4 border-2 shadow-lg ${
              showRejected
                ? "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200"
                : "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${showRejected ? "bg-rose-100" : "bg-emerald-100"}`}>
                  {showRejected ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  )}
                </div>
                <span
                  className={`font-bold text-sm sm:text-base ${showRejected ? "text-rose-700" : "text-emerald-700"}`}
                >
                  Mostrando {filteredSolicitudes.length} de{" "}
                  {
                    solicitudes.filter((s) => (showRejected ? s.estado === "rechazado" : s.estado === "aceptado"))
                      .length
                  }{" "}
                  solicitudes {showRejected ? "rechazadas" : "aceptadas"}
                </span>
              </div>
              {(searchTerm || filtroCodigo || filtroSemestre || filtroModulo || filtroFecha) && (
                <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Filtros aplicados
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabla Mejorada */}
        <div
          className={`transform transition-all duration-1000 delay-400 ${animationStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-xs sm:text-sm min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Semestre
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Fecha Solicitud
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {currentSolicitudes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                        <div className="space-y-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-slate-600">
                              {showRejected ? "No hay solicitudes rechazadas" : "No hay solicitudes aceptadas"}
                            </p>
                            <p className="text-slate-500 text-xs sm:text-sm">
                              Los registros aparecerán aquí cuando estén disponibles
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentSolicitudes.map((solicitud, index) => (
                      <tr
                        key={solicitud.solicitud_id}
                        className="hover:bg-white/80 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 font-bold whitespace-nowrap">
                          {solicitud.solicitud_id}
                        </td>
                        <td
                          className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 font-medium max-w-[150px] truncate"
                          title={`${solicitud.nombres || ""} ${solicitud.apellidos || ""}`.trim()}
                        >
                          {`${solicitud.nombres || ""} ${solicitud.apellidos || ""}`.trim()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 font-mono font-bold whitespace-nowrap">
                          {solicitud.codigo_alumno}
                        </td>
                        <td
                          className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 max-w-[150px] truncate"
                          title={solicitud.modulo_solicitado}
                        >
                          {solicitud.modulo_solicitado}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 font-medium whitespace-nowrap">
                          {solicitud.semestre_actual}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900 whitespace-nowrap">
                          {formatearFecha(solicitud.fecha_solicitud)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {getEstadoBadge(solicitud.estado)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex space-x-1 sm:space-x-2">
                            {solicitud.estado === "aceptado" ? (
                              <button
                                onClick={() => handlePreview(solicitud)}
                                disabled={loadingConstancias[solicitud.solicitud_id]}
                                className="p-1 sm:p-2 text-indigo-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105"
                                title="Vista previa de la constancia"
                              >
                                {loadingConstancias[solicitud.solicitud_id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-indigo-600 border-t-transparent"></div>
                                ) : (
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => console.log("Reactivar solicitud:", solicitud.solicitud_id)}
                                className="p-1 sm:p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-110 group-hover:scale-105"
                                title="Reactivar solicitud"
                              >
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación Mejorada */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredSolicitudes.length)} de{" "}
                    {filteredSolicitudes.length} registros
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold shadow-md text-xs sm:text-sm">
                      Página {currentPage} de {totalPages}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Preview */}
        {showPreview && <ConstanciaPreview constancia={selectedConstancia} onClose={() => setShowPreview(false)} />}
      </div>

      <style jsx>{`
        .animation-delay-150 { animation-delay: 0.15s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

export default ConstanciaList
