"use client"

import { useState, useEffect } from "react"

import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Shield,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react"

import { useAuth } from "../context/AuthContext"

import { solicitudesService, calcularEstadisticas } from "../services/solicitudesService"

const Home = () => {
  const { user } = useAuth()
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
  })
  const [actividadReciente, setActividadReciente] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    cargarDatos()

    // Animación escalonada
    const timer = setTimeout(() => setAnimationStage(1), 100)
    const timer2 = setTimeout(() => setAnimationStage(2), 300)
    const timer3 = setTimeout(() => setAnimationStage(3), 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Obtener todas las solicitudes para estadísticas
      const todasSolicitudes = await solicitudesService.getAllSolicitudes()
      const stats = calcularEstadisticas(todasSolicitudes.data || todasSolicitudes)
      setEstadisticas(stats)

      // Obtener actividad reciente (últimas 5 solicitudes)
      const solicitudesRecientes = (todasSolicitudes.data || todasSolicitudes)
        .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud))
        .slice(0, 5)

      setActividadReciente(solicitudesRecientes)
    } catch (err) {
      console.error("Error cargando datos:", err)
      setError("Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

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
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formateando fecha:", error, "Fecha original:", fecha)
      return "Fecha inválida"
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
      case "aceptado":
        return "text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
      case "rechazado":
        return "text-rose-700 bg-gradient-to-r from-rose-50 to-red-50 border-rose-200"
      default:
        return "text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
    }
  }

  // 🚀 NUEVA FUNCIÓN - Colores de fondo para las tarjetas
  const getCardBackgroundColor = (estado) => {
    switch (estado) {
      case "aceptado":
        return "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200 hover:from-emerald-100 hover:via-green-100 hover:to-teal-100"
      case "rechazado":
        return "bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 border-rose-200 hover:from-rose-100 hover:via-red-100 hover:to-pink-100"
      case "pendiente":
        return "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200 hover:from-amber-100 hover:via-yellow-100 hover:to-orange-100"
      default:
        return "bg-gradient-to-br from-white via-slate-50 to-gray-50 border-slate-200 hover:from-slate-50 hover:via-gray-50 hover:to-slate-100"
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "pendiente":
        return "En revisión"
      case "aceptado":
        return "Aprobada"
      case "rechazado":
        return "Rechazada"
      default:
        return estado
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "aceptado":
        return <CheckCircle className="w-4 h-4" />
      case "rechazado":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatIcon = (tipo) => {
    switch (tipo) {
      case "total":
        return <FileText className="w-6 h-6" />
      case "pendientes":
        return <Clock className="w-6 h-6" />
      case "aprobadas":
        return <CheckCircle className="w-6 h-6" />
      case "rechazadas":
        return <XCircle className="w-6 h-6" />
      default:
        return <TrendingUp className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-teal-400 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-slate-700 animate-pulse">CertiPro Admin</p>
            <p className="text-slate-500 animate-bounce">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-0 space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header de Bienvenida Mejorado */}
        <div
          className={`transform transition-all duration-1000 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-2xl">
            {/* Patrón de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-700/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-pulse"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                      ¡Bienvenido(a), {user ? `${user.nombres} ${user.apellidos}` : "Secretaria"}!
                    </h1>
                    <p className="text-emerald-100 text-lg">Panel Administrativo - Gestión de Constancias</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{user ? user.rol : "SECRETARIA"}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Administrador</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={cargarDatos}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas Mejoradas */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                key: "total",
                label: "Total",
                value: estadisticas.total,
                color: "from-slate-500 to-gray-600",
                bg: "from-slate-50 to-gray-50",
              },
              {
                key: "pendientes",
                label: "En revisión",
                value: estadisticas.pendientes,
                color: "from-amber-500 to-yellow-600",
                bg: "from-amber-50 to-yellow-50",
              },
              {
                key: "aprobadas",
                label: "Aprobadas",
                value: estadisticas.aprobadas,
                color: "from-emerald-500 to-green-600",
                bg: "from-emerald-50 to-green-50",
              },
              {
                key: "rechazadas",
                label: "Rechazadas",
                value: estadisticas.rechazadas,
                color: "from-rose-500 to-red-600",
                bg: "from-rose-50 to-red-50",
              },
            ].map((stat, index) => (
              <div
                key={stat.key}
                className={`bg-gradient-to-br ${stat.bg} rounded-xl p-6 shadow-lg border border-white/50 backdrop-blur-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 font-medium mt-1">{stat.label}</div>
                  </div>
                  <div
                    className={`p-3 bg-gradient-to-r ${stat.color} rounded-full text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                  >
                    {getStatIcon(stat.key)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente Mejorada */}
        <div
          className={`transform transition-all duration-1000 delay-400 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Actividad Reciente</h2>
                  <p className="text-slate-600">Últimas solicitudes de constancias</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {actividadReciente.length > 0 ? (
                <div className="space-y-6">
                  {actividadReciente.map((solicitud, index) => (
                    <div
                      key={solicitud.solicitud_id || index}
                      className={`group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${getCardBackgroundColor(solicitud.estado)}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div
                            className={`p-4 rounded-full border-2 ${getEstadoColor(solicitud.estado)} shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                          >
                            {getEstadoIcon(solicitud.estado)}
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors">
                              {solicitud.tipo_constancia || solicitud.modulo_solicitado || "Constancia"}
                            </h3>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {solicitud.nombre_estudiante || solicitud.estudiante_nombre || "Estudiante"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Solicitada el {formatearFecha(solicitud.fecha_solicitud)}</span>
                            </div>

                            {solicitud.motivo_rechazo && (
                              <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 rounded-lg px-3 py-1 w-fit">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Motivo: {solicitud.motivo_rechazo}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getEstadoColor(solicitud.estado)} shadow-md group-hover:shadow-lg transition-all duration-300`}
                          >
                            {getEstadoTexto(solicitud.estado)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-semibold text-slate-600">No hay actividad reciente</p>
                      <p className="text-slate-500">Las nuevas solicitudes aparecerán aquí</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-150 { animation-delay: 0.15s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

export default Home
