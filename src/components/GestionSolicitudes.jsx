"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Download,
} from "lucide-react"
import { solicitudesService, calcularEstadisticas } from "../services/solicitudesService"

const GestionSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [animationStage, setAnimationStage] = useState(0)
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
  })

  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroSemestre, setFiltroSemestre] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Animaciones escalonadas
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStage(1), 100)
    const timer2 = setTimeout(() => setAnimationStage(2), 300)
    const timer3 = setTimeout(() => setAnimationStage(3), 500)
    const timer4 = setTimeout(() => setAnimationStage(4), 700)
    const timer5 = setTimeout(() => setAnimationStage(5), 900)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    cargarSolicitudes()
  }, [])

  // Filtrar solicitudes cuando cambia cualquier filtro
  useEffect(() => {
    let filtered = [...solicitudes]

    // Filtro por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (solicitud) =>
          `${solicitud.nombres || ""} ${solicitud.apellidos || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solicitud.codigo_alumno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solicitud.solicitud_id.toString().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por estado
    if (filtroEstado && filtroEstado !== "todos") {
      filtered = filtered.filter((solicitud) => solicitud.estado === filtroEstado)
    }

    // Filtro por semestre
    if (filtroSemestre && filtroSemestre !== "todos") {
      filtered = filtered.filter((solicitud) => solicitud.semestre_actual?.toString() === filtroSemestre)
    }

    // Filtro por módulo
    if (filtroModulo && filtroModulo !== "todos") {
      filtered = filtered.filter((solicitud) =>
        solicitud.modulo_solicitado?.toLowerCase().includes(filtroModulo.toLowerCase()),
      )
    }

    // Filtro por fecha (último mes, última semana, etc.)
    if (filtroFecha && filtroFecha !== "todos") {
      const now = new Date()
      const filteredByDate = filtered.filter((solicitud) => {
        if (!solicitud.fecha_solicitud) return false

        const [dia, mes, anio] = solicitud.fecha_solicitud.split("/")
        const fechaSolicitud = new Date(`${anio}-${mes}-${dia}`)

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
      })
      filtered = filteredByDate
    }

    setFilteredSolicitudes(filtered)
  }, [searchTerm, solicitudes, filtroEstado, filtroSemestre, filtroModulo, filtroFecha])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroEstado("")
    setFiltroSemestre("")
    setFiltroModulo("")
    setFiltroFecha("")
  }

  const semestreOptions = [...new Set(solicitudes.map((s) => s.semestre_actual).filter(Boolean))]
  const moduloOptions = [...new Set(solicitudes.map((s) => s.modulo_solicitado).filter(Boolean))]

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await solicitudesService.getAllSolicitudes()

      setSolicitudes(data)
      setFilteredSolicitudes(data)
      setEstadisticas(calcularEstadisticas(data))
    } catch (err) {
      setError(err.message)
      console.error("❌ Error al cargar solicitudes:", err)
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = async (solicitud) => {
    try {
      const detalle = await solicitudesService.getSolicitudDetalle(solicitud.solicitud_id)
      setSelectedSolicitud(detalle)
      setShowModal(true)
    } catch (err) {
      console.error("🔴 Error al cargar detalle:", err)
      setError("Error al cargar los detalles de la solicitud")
    }
  }

  const cerrarModal = () => {
    setShowModal(false)
    setSelectedSolicitud(null)
  }

  const aceptarSolicitud = async (solicitudId) => {
    try {
      await solicitudesService.aceptarSolicitud(solicitudId)
      await cargarSolicitudes()
      cerrarModal()
    } catch (err) {
      setError("Error al aceptar la solicitud")
      console.error(err)
    }
  }

  const rechazarSolicitud = async (solicitudId) => {
    try {
      const motivo = prompt("Ingrese el motivo del rechazo:")
      if (motivo) {
        await solicitudesService.rechazarSolicitud(solicitudId, motivo)
        await cargarSolicitudes()
        cerrarModal()
      }
    } catch (err) {
      setError("Error al rechazar la solicitud")
      console.error(err)
    }
  }

  const getEstadoBadge = (estado) => {
    const badgeClasses = {
      pendiente: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm",
      aceptado: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm",
      rechazado: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200 shadow-sm",
    }

    const estadoTexto = {
      pendiente: "pendiente",
      aceptado: "aprobado",
      rechazado: "rechazado",
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${badgeClasses[estado] || badgeClasses.pendiente} hover:scale-105 transition-transform duration-200`}
      >
        {estadoTexto[estado] || estado}
      </span>
    )
  }

  const getNotaColor = (nota) => {
    if (nota >= 16) return "text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
    if (nota >= 13) return "text-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
    return "text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200"
  }

  const parseFecha = (fechaStr) => {
    if (!fechaStr || typeof fechaStr !== "string") return "Fecha inválida"
    const [dia, mes, anio] = fechaStr.split("/")
    const isoString = `${anio}-${mes}-${dia}`
    const fecha = new Date(isoString)
    if (isNaN(fecha.getTime())) return "Fecha inválida"
    const opciones = {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
    return fecha.toLocaleDateString("es-PE", opciones).replace(".", "")
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
        {/* Header */}
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
                      Gestión de Solicitudes
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-lg">
                      Administra las solicitudes de convalidación encaminadas
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

        {/* Mostrar error si existe */}
        {error && (
          <div
            className={`transform transition-all duration-1000 delay-100 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={cargarSolicitudes}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Solicitudes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{estadisticas.total}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pendientes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{estadisticas.pendientes}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Aprobadas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{estadisticas.aprobadas}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Rechazadas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2">{estadisticas.rechazadas}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda mejorados */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
            {/* Barra de búsqueda principal */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <button
                onClick={cargarSolicitudes}
                className="flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
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
                  {/* Filtro por Estado */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </div>

                  {/* Filtro por Semestre */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Semestre</label>
                    <select
                      value={filtroSemestre}
                      onChange={(e) => setFiltroSemestre(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todos los semestres</option>
                      {semestreOptions.sort().map((semestre) => (
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
                      onChange={(e) => setFiltroModulo(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm"
                    >
                      <option value="">Todos los módulos</option>
                      {moduloOptions.sort().map((modulo) => (
                        <option key={modulo} value={modulo}>
                          {modulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Fecha */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                    <select
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
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
                  {filtroEstado && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                      Estado: {filtroEstado}
                      <button onClick={() => setFiltroEstado("")} className="ml-2 hover:text-blue-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroSemestre && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                      Semestre: {filtroSemestre}
                      <button onClick={() => setFiltroSemestre("")} className="ml-2 hover:text-green-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroModulo && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200">
                      Módulo: {filtroModulo}
                      <button onClick={() => setFiltroModulo("")} className="ml-2 hover:text-purple-900">
                        ×
                      </button>
                    </span>
                  )}
                  {filtroFecha && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200">
                      Fecha: {filtroFecha}
                      <button onClick={() => setFiltroFecha("")} className="ml-2 hover:text-amber-900">
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de resultados */}
        <div
          className={`transform transition-all duration-1000 delay-350 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border-2 border-slate-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-700">
                  Mostrando {filteredSolicitudes.length} de {solicitudes.length} solicitudes
                </span>
              </div>
              {(searchTerm || filtroEstado || filtroSemestre || filtroModulo || filtroFecha) && (
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Filtros aplicados</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div
          className={`transform transition-all duration-1000 delay-400 ${animationStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm table-auto min-w-[700px]">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Solicitado
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
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {filteredSolicitudes.map((solicitud, index) => (
                    <tr
                      key={solicitud.id}
                      className="hover:bg-white/80 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">#{solicitud.solicitud_id}</div>
                        <div className="text-xs sm:text-sm text-slate-500">{parseFecha(solicitud.fecha_solicitud)}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-xs sm:text-sm font-bold text-white">
                                {solicitud.nombres?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-xs sm:text-sm font-bold text-slate-900">
                              {`${solicitud.nombres} ${solicitud.apellidos}`}
                            </div>
                            <div className="text-xs text-slate-500">Semestre {solicitud.semestre_actual || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono font-bold text-slate-900">
                        {solicitud.codigo_alumno || "N/A"}
                      </td>
                      <td
                        className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 max-w-[150px] truncate"
                        title={solicitud.modulo_solicitado}
                      >
                        {solicitud.modulo_solicitado || "N/A"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{getEstadoBadge(solicitud.estado)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => abrirModal(solicitud)}
                          className="text-indigo-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-lg p-2 transition-all duration-300 hover:shadow-lg transform hover:scale-110 group-hover:scale-105 flex items-center"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSolicitudes.length === 0 && !loading && (
              <div className="text-center py-12 sm:py-16">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-slate-600">No se encontraron solicitudes</p>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      Los registros aparecerán aquí cuando estén disponibles
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal mejorado */}
        {showModal && selectedSolicitud && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Solicitud #{selectedSolicitud.solicitud_id}
                  </h2>
                  <button
                    onClick={cerrarModal}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-all duration-300 transform hover:scale-110"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Información del estudiante */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Información del Estudiante
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">Nombre Completo:</p>
                      <p className="text-blue-900 font-medium">
                        {selectedSolicitud.nombres} {selectedSolicitud.apellidos}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">Código de Estudiante:</p>
                      <p className="text-blue-900 font-mono font-bold">{selectedSolicitud.codigo_alumno || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">Semestre Actual:</p>
                      <p className="text-blue-900 font-medium">{selectedSolicitud.semestre_actual || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">Módulo Solicitado:</p>
                      <p className="text-blue-900 font-medium">{selectedSolicitud.modulo_solicitado || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Detalle de notas por semestre */}
                {selectedSolicitud.detalle_notas &&
                  Object.entries(selectedSolicitud.detalle_notas).map(([semestre, cursos]) => (
                    <div key={semestre} className="mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                        Registro Académico - {semestre}
                      </h3>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl shadow-lg">
                        <h4 className="font-bold text-lg">{semestre}</h4>
                      </div>
                      <div className="border-2 border-slate-200 rounded-b-2xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Curso
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Nota Final
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {cursos.map((curso, index) => (
                                <tr
                                  key={`${curso.curso}-${index}`}
                                  className="hover:bg-slate-50 transition-colors duration-200"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{curso.curso}</td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getNotaColor(curso.nota_final)} shadow-sm`}
                                    >
                                      {curso.nota_final}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                        curso.estado === "aprobado"
                                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                                          : curso.estado === "recuperable"
                                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200"
                                            : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
                                      }`}
                                    >
                                      {curso.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-slate-200">
                  <button
                    onClick={cerrarModal}
                    className="px-6 py-3 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => aceptarSolicitud(selectedSolicitud.solicitud_id)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceptar Solicitud
                  </button>
                  <button
                    onClick={() => rechazarSolicitud(selectedSolicitud.solicitud_id)}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animation-delay-150 { animation-delay: 0.15s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

export default GestionSolicitudes
