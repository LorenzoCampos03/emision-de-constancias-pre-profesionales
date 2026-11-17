"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  User,
  Calendar,
  Award,
  Building,
  Send,
  Edit3,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { solicitudesService } from "../../services/solicitudesService"
import constanciaService from "../../services/constanciaService"
import html2pdf from "html2pdf.js"
import logoVallegrande from "../../assets/vallegrande.png"

const Solicitudes = () => {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [animationStage, setAnimationStage] = useState(0)

  // Estados para el preview - CAMBIADO: ahora maneja múltiples solicitudes
  const [showPreview, setShowPreview] = useState(false)
  const [selectedConstancia, setSelectedConstancia] = useState(null)
  const [loadingConstancias, setLoadingConstancias] = useState({}) // NUEVO: objeto para manejar loading individual
  const [isDownloading, setIsDownloading] = useState(false)
  const documentRef = useRef()

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre_evento: "",
    nombre_certificacion: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    cantidad_horas: "",
    proyecto_nombre: "",
    actividades: "",
    modulo_id: "1",
  })

  // 🚀 NUEVO: Estados para errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre_evento: "",
    nombre_certificacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    cantidad_horas: "",
    proyecto_nombre: "",
    descripcion: "",
    actividades: "",
  })

  // 🚀 NUEVAS FUNCIONES DE VALIDACIÓN
  const validarSinNumeros = (texto, nombreCampo) => {
    if (!texto.trim()) {
      return `${nombreCampo} es obligatorio`
    }
    if (/\d/.test(texto)) {
      return `${nombreCampo} no puede contener números`
    }
    if (texto.trim().length < 3) {
      return `${nombreCampo} debe tener al menos 3 caracteres`
    }
    return ""
  }

  const validarTextoLibre = (texto, nombreCampo) => {
    if (!texto.trim()) {
      return `${nombreCampo} es obligatorio`
    }
    if (texto.trim().length < 10) {
      return `${nombreCampo} debe tener al menos 10 caracteres`
    }
    return ""
  }

  const validarFechas = (fechaInicio, fechaFin) => {
    const errores = { fecha_inicio: "", fecha_fin: "" }

    if (!fechaInicio) {
      errores.fecha_inicio = "La fecha de inicio es obligatoria"
    }
    if (!fechaFin) {
      errores.fecha_fin = "La fecha de fin es obligatoria"
    }

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)

      if (inicio >= fin) {
        errores.fecha_inicio = "La fecha de inicio debe ser anterior a la fecha de fin"
        errores.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
    }

    return errores
  }

  const validarHoras = (horas) => {
    if (!horas) {
      return "La cantidad de horas es obligatoria"
    }
    const numHoras = Number.parseInt(horas)
    if (isNaN(numHoras) || numHoras < 400) {
      return "La cantidad mínima de horas debe ser 400"
    }
    return ""
  }

  // 🚀 FUNCIÓN PARA VALIDAR UN CAMPO ESPECÍFICO
  const validarCampo = (nombre, valor) => {
    let error = ""

    switch (nombre) {
      case "nombre_evento":
        error = validarSinNumeros(valor, "Nombre del evento")
        break
      case "nombre_certificacion":
        error = validarSinNumeros(valor, "Nombre de la certificación")
        break
      case "proyecto_nombre":
        error = validarSinNumeros(valor, "Nombre del proyecto")
        break
      case "descripcion":
        error = validarTextoLibre(valor, "Descripción")
        break
      case "actividades":
        error = validarTextoLibre(valor, "Actividades realizadas")
        break
      case "cantidad_horas":
        error = validarHoras(valor)
        break
      default:
        break
    }

    return error
  }

  // 🚀 FUNCIÓN PARA VALIDAR TODO EL FORMULARIO
  const validarFormulario = () => {
    const errores = {
      nombre_evento: validarCampo("nombre_evento", formData.nombre_evento),
      nombre_certificacion: validarCampo("nombre_certificacion", formData.nombre_certificacion),
      proyecto_nombre: validarCampo("proyecto_nombre", formData.proyecto_nombre),
      descripcion: validarCampo("descripcion", formData.descripcion),
      actividades: validarCampo("actividades", formData.actividades),
      cantidad_horas: validarCampo("cantidad_horas", formData.cantidad_horas),
      ...validarFechas(formData.fecha_inicio, formData.fecha_fin),
    }

    setFormErrors(errores)

    // Verificar si hay errores
    return Object.values(errores).every((error) => error === "")
  }

  useEffect(() => {
    if (user?.user_id) {
      cargarSolicitudes()
    }
    // Animación escalonada
    const timer = setTimeout(() => setAnimationStage(1), 100)
    const timer2 = setTimeout(() => setAnimationStage(2), 300)
    const timer3 = setTimeout(() => setAnimationStage(3), 500)
    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [user])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      // 🚀 CAMBIO: Usar getAllSolicitudes en lugar de getSolicitudesByUser
      const response = await solicitudesService.getAllSolicitudes(false)
      const solicitudesData = response.data || response

      console.log("🔍 TODAS LAS SOLICITUDES:", solicitudesData)

      // 🚀 NUEVO: Filtrar por usuario en el frontend
      const solicitudesDelUsuario = solicitudesData.filter(
        (solicitud) =>
          solicitud &&
          solicitud.user_id === user.user_id && // Usa el user que ya tienes del useAuth()
          solicitud.solicitud_id !== null &&
          solicitud.fecha_solicitud !== "None" &&
          solicitud.fecha_solicitud !== null,
      )

      console.log("🔍 SOLICITUDES FILTRADAS POR USUARIO:", solicitudesDelUsuario)

      const solicitudesOrdenadas = solicitudesDelUsuario.sort(
        (a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud),
      )

      setSolicitudes(solicitudesOrdenadas)
      console.log("🔍 SOLICITUDES FINALES:", solicitudesOrdenadas)
    } catch (err) {
      console.error("Error cargando solicitudes:", err)
      setError("Error al cargar las solicitudes")
    } finally {
      setLoading(false)
    }
  }

  // 🚀 MODIFICADO: handleInputChange con validación en tiempo real
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Actualizar el valor
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validar el campo en tiempo real
    const error = validarCampo(name, value)
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    // Validar fechas cuando cambie cualquiera de las dos
    if (name === "fecha_inicio" || name === "fecha_fin") {
      const fechaInicio = name === "fecha_inicio" ? value : formData.fecha_inicio
      const fechaFin = name === "fecha_fin" ? value : formData.fecha_fin
      const erroresFechas = validarFechas(fechaInicio, fechaFin)

      setFormErrors((prev) => ({
        ...prev,
        ...erroresFechas,
      }))
    }
  }

  // 🚀 MODIFICADO: handleSubmit con validación completa
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todo el formulario antes de enviar
    const esValido = validarFormulario()

    if (!esValido) {
      setError("Por favor, corrige los errores en el formulario antes de enviar")
      return
    }

    setEnviando(true)
    setError("")
    setMensaje("")

    try {
      const constanciaData = {
        nombre_evento: formData.nombre_evento,
        nombre_certificacion: formData.nombre_certificacion,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        cantidad_horas: Number.parseInt(formData.cantidad_horas),
        proyecto_nombre: formData.proyecto_nombre,
        actividades: formData.actividades,
        modulo_id: Number.parseInt(formData.modulo_id),
      }

      await constanciaService.createConstanciaEstudiante(constanciaData)

      setMensaje("Solicitud de constancia creada exitosamente y está en revisión")
      setMostrarFormulario(false)
      setFormData({
        nombre_evento: "",
        nombre_certificacion: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        cantidad_horas: "",
        proyecto_nombre: "",
        actividades: "",
        modulo_id: "1",
      })
      // Limpiar errores
      setFormErrors({
        nombre_evento: "",
        nombre_certificacion: "",
        fecha_inicio: "",
        fecha_fin: "",
        cantidad_horas: "",
        proyecto_nombre: "",
        descripcion: "",
        actividades: "",
      })
      cargarSolicitudes()
    } catch (err) {
      console.error("Error enviando solicitud:", err)
      setError(err.message || "Error al enviar la solicitud de constancia")
    } finally {
      setEnviando(false)
    }
  }

  // 🚀 FUNCIÓN MEJORADA - Loading individual por solicitud
  const handlePreview = async (solicitud) => {
    const solicitudId = solicitud.solicitud_id

    try {
      // NUEVO: Set loading individual para esta solicitud
      setLoadingConstancias((prev) => ({ ...prev, [solicitudId]: true }))
      setError("")

      console.log("🔍 === INICIO PREVIEW OPTIMIZADO ===")
      console.log("📋 Solicitud:", solicitud)
      console.log("👤 Usuario:", user)

      const constancia = await constanciaService.buscarConstanciaCompleta(solicitud.solicitud_id, user?.user_id)

      if (constancia) {
        const constanciaCompleta = {
          ...constancia,
          nombre_usuario: constancia.nombre_usuario || `${user?.nombres || ""} ${user?.apellidos || ""}`.trim(),
          nombres: constancia.nombres || user?.nombres,
          apellidos: constancia.apellidos || user?.apellidos,
          numero_documento: constancia.numero_documento || user?.numero_documento,
          document_type: constancia.document_type || user?.document_type || "DNI",
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
      // NUEVO: Remove loading individual para esta solicitud
      setLoadingConstancias((prev) => {
        const newState = { ...prev }
        delete newState[solicitudId]
        return newState
      })
      console.log("🔍 === FIN PREVIEW OPTIMIZADO ===")
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const element = documentRef.current
      const opt = {
        margin: 0.5,
        filename: `constancia_${selectedConstancia.nombre_usuario || selectedConstancia.nombres || "documento"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error al generar PDF:", error)
      setError("Error al generar el PDF. Por favor, inténtalo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"

    try {
      let date

      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/")
        date = new Date(`${year}-${month}-${day}`)
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date)) return "Fecha inválida"

      const day = date.getDate()
      const month = date.toLocaleString("es-PE", { month: "short" }).toLowerCase()
      const year = date.getFullYear()

      return `${day}-${month}-${year}`
    } catch (error) {
      console.error("Error formateando fecha:", error)
      return "Fecha inválida"
    }
  }

  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  const getMonthInSpanish = (date) => {
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]
    return months[date.getMonth()]
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

  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [mensaje, error])

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
            <p className="text-slate-500 animate-bounce">Cargando tus solicitudes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div
          className={`transform transition-all duration-1000 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
            {/* Patrón de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-700/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Mis Solicitudes
                    </h1>
                    <p className="text-blue-100 text-lg">Gestiona tus solicitudes de constancias</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Realizar Solicitud</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes Mejorados */}
        {mensaje && (
          <div
            className={`transform transition-all duration-500 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">{mensaje}</p>
                </div>
                <button
                  onClick={() => setMensaje("")}
                  className="text-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className={`transform transition-all duration-500 ${animationStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Nueva Solicitud Mejorado */}
        {mostrarFormulario && (
          <div
            className={`transform transition-all duration-1000 delay-200 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                      <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud de Constancia</h2>
                      <p className="text-slate-600">Completa los datos para tu solicitud</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 🚀 CAMPO 1: Nombre del Evento - CON VALIDACIÓN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Nombre del Evento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre_evento"
                        value={formData.nombre_evento}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          formErrors.nombre_evento
                            ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                        }`}
                        placeholder="Ej: Congreso de Tecnología"
                      />
                      {formErrors.nombre_evento && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.nombre_evento}</span>
                        </p>
                      )}
                    </div>

                    {/* 🚀 CAMPO 2: Nombre de la Certificación - CON VALIDACIÓN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Nombre de la Certificación <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre_certificacion"
                        value={formData.nombre_certificacion}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          formErrors.nombre_certificacion
                            ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                        }`}
                        placeholder="Ej: Certificado de Participación"
                      />
                      {formErrors.nombre_certificacion && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.nombre_certificacion}</span>
                        </p>
                      )}
                    </div>

                    {/* 🚀 CAMPO 3: Fecha de Inicio - CON VALIDACIÓN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Fecha de Inicio <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          formErrors.fecha_inicio
                            ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                        }`}
                      />
                      {formErrors.fecha_inicio && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.fecha_inicio}</span>
                        </p>
                      )}
                    </div>

                    {/* 🚀 CAMPO 4: Fecha de Fin - CON VALIDACIÓN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Fecha de Fin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          formErrors.fecha_fin
                            ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                        }`}
                      />
                      {formErrors.fecha_fin && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.fecha_fin}</span>
                        </p>
                      )}
                    </div>

                    {/* 🚀 CAMPO 5: Cantidad de Horas - CON VALIDACIÓN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Cantidad de Horas <span className="text-red-500">*</span>
                        <span className="text-xs text-slate-500 ml-2">(Mínimo 400 horas)</span>
                      </label>
                      <input
                        type="number"
                        name="cantidad_horas"
                        value={formData.cantidad_horas}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          formErrors.cantidad_horas
                            ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                            : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                        }`}
                        placeholder="Ej: 400"
                        min="400"
                      />
                      {formErrors.cantidad_horas && (
                        <p className="text-red-600 text-sm flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.cantidad_horas}</span>
                        </p>
                      )}
                    </div>

                    {/* 🚀 CAMPO 6: Módulo - SIN CAMBIOS */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Módulo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="modulo_id"
                        value={formData.modulo_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
                      >
                        <option value="1">Módulo I</option>
                        <option value="2">Módulo II</option>
                        <option value="3">Módulo III</option>
                      </select>
                    </div>
                  </div>

                  {/* 🚀 CAMPO 7: Nombre del Proyecto - CON VALIDACIÓN */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Nombre del Proyecto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="proyecto_nombre"
                      value={formData.proyecto_nombre}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                        formErrors.proyecto_nombre
                          ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                          : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                      }`}
                      placeholder="Ej: Sistema de Gestión Académica"
                    />
                    {formErrors.proyecto_nombre && (
                      <p className="text-red-600 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.proyecto_nombre}</span>
                      </p>
                    )}
                  </div>

                  {/* 🚀 CAMPO 8: Descripción - CON VALIDACIÓN */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm resize-none ${
                        formErrors.descripcion
                          ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                          : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                      }`}
                      placeholder="Describe brevemente la actividad o evento..."
                    />
                    {formErrors.descripcion && (
                      <p className="text-red-600 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.descripcion}</span>
                      </p>
                    )}
                  </div>

                  {/* 🚀 CAMPO 9: Actividades Realizadas - CON VALIDACIÓN */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Actividades Realizadas <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="actividades"
                      value={formData.actividades}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm resize-none ${
                        formErrors.actividades
                          ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                          : "border-slate-200 focus:ring-blue-400 focus:border-transparent"
                      }`}
                      placeholder="Detalla las actividades que realizaste..."
                    />
                    {formErrors.actividades && (
                      <p className="text-red-600 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.actividades}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all duration-300 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {enviando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Solicitud</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Solicitudes Mejorada */}
        <div
          className={`transform transition-all duration-1000 delay-400 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-8 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Historial de Solicitudes</h2>
                  <p className="text-slate-600">Seguimiento completo de tus constancias</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {solicitudes.length > 0 ? (
                <div className="space-y-6">
                  {solicitudes.map((solicitud, index) => (
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
                              {solicitud.modulo_solicitado || solicitud.nombre_modulo || "Constancia"}
                            </h3>
                            <div className="flex items-center space-x-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Solicitada el {formatearFecha(solicitud.fecha_solicitud)}</span>
                            </div>
                            {solicitud.motivo_rechazo && (
                              <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 rounded-lg px-3 py-1 w-fit">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Motivo de rechazo: {solicitud.motivo_rechazo}
                                </span>
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

                          {/* 🚀 BOTÓN MEJORADO - Loading individual */}
                          {solicitud.estado === "aceptado" && (
                            <button
                              onClick={() => handlePreview(solicitud)}
                              disabled={loadingConstancias[solicitud.solicitud_id]}
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              title="Ver vista previa de la constancia"
                            >
                              {loadingConstancias[solicitud.solicitud_id] ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Cargando...</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span>Preview</span>
                                </>
                              )}
                            </button>
                          )}
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
                      <p className="text-xl font-semibold text-slate-600">No tienes solicitudes aún</p>
                      <p className="text-slate-500">
                        ¡Haz clic en "Realizar Solicitud" para crear tu primera solicitud!
                      </p>
                      <button
                        onClick={() => setMostrarFormulario(true)}
                        className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Crear Solicitud
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Preview - SIN CAMBIOS MAYORES AL DOCUMENTO */}
      {showPreview && selectedConstancia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
            {/* Header del modal */}
            <div
              className="text-white p-6 flex items-center justify-between rounded-t-2xl"
              style={{ background: "linear-gradient(to right, #1d4ed8, #1e40af)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Vista Previa de Constancia</h2>
                  <p className="text-sm" style={{ color: "#bfdbfe" }}>
                    Instituto Valle Grande - Documento Oficial
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Información del estudiante */}
            <div className="p-4" style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: "#2563eb" }} />
                  <span className="font-medium">Estudiante:</span>
                  <span style={{ color: "#374151" }}>
                    {selectedConstancia?.nombre_usuario ||
                      `${selectedConstancia?.nombres || ""} ${selectedConstancia?.apellidos || ""}`.trim() ||
                      "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: "#16a34a" }} />
                  <span className="font-medium">Periodo:</span>
                  <span style={{ color: "#374151" }}>
                    {formatDate(selectedConstancia?.fecha_inicio)} / {formatDate(selectedConstancia?.fecha_fin)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "#9333ea" }} />
                  <span className="font-medium">Horas:</span>
                  <span style={{ color: "#374151" }}>{selectedConstancia?.cantidad_horas || 0}h</span>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" style={{ color: "#ea580c" }} />
                  <span className="font-medium">Estado:</span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        selectedConstancia?.estado_solicitud === "Aceptado" ||
                        selectedConstancia?.estado_solicitud === "generada" ||
                        selectedConstancia?.estado_solicitud === "aceptado"
                          ? "#dcfce7"
                          : selectedConstancia?.estado_solicitud === "Pendiente"
                            ? "#fef3c7"
                            : "#fee2e2",
                      color:
                        selectedConstancia?.estado_solicitud === "Aceptado" ||
                        selectedConstancia?.estado_solicitud === "generada" ||
                        selectedConstancia?.estado_solicitud === "aceptado"
                          ? "#166534"
                          : selectedConstancia?.estado_solicitud === "Pendiente"
                            ? "#92400e"
                            : "#991b1b",
                    }}
                  >
                    {selectedConstancia?.estado_solicitud || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Documento - MANTENER EXACTAMENTE IGUAL */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div
                ref={documentRef}
                className="p-8 bg-white max-w-4xl mx-auto"
                style={{
                  fontFamily: "Times New Roman, serif",
                  lineHeight: "1.6",
                  color: "#1a1a1a",
                }}
              >
                {/* Header del documento */}
                <div className="text-center mb-8">
                  <div className="w-full h-1 rounded-full mb-6" style={{ backgroundColor: "#1d4ed8" }}></div>
                  <div className="flex justify-center items-center mb-4">
                    <div className="w-30 h-30 overflow-hidden flex items-center justify-center">
                      <img
                        src={logoVallegrande || "/placeholder.svg"}
                        alt="Logo Valle Grande"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "block"
                        }}
                      />
                      <div className="hidden">
                        <Building className="w-12 h-12" style={{ color: "#16a34a" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm italic mb-4" style={{ color: "#4b5563" }}>
                      "Año del Fortalecimiento de la Soberanía Nacional"
                    </p>
                  </div>

                  <div className="border-2 p-4 mb-4" style={{ borderColor: "#1f2937", backgroundColor: "#f9fafb" }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: "#1f2937" }}>
                      CONSTANCIA DE PRÁCTICAS PRE – PROFESIONALES
                    </h2>

                    <div className="text-white py-2 px-4 mx-4" style={{ backgroundColor: "#1f2937" }}>
                      <h3 className="text-base font-bold">
                        {selectedConstancia?.modulo_solicitado || "MÓDULO TÉCNICO PROFESIONAL Nº 01"}
                      </h3>
                    </div>

                    <p className="text-lg font-bold mt-2" style={{ color: "#1f2937" }}>
                      "{selectedConstancia?.nombre_certificacion || "Soporte Técnico y Ofimático"}"
                    </p>
                  </div>
                </div>

                {/* Cuerpo del documento */}
                <div className="text-justify leading-relaxed text-base">
                  <p className="mb-6">
                    El que suscribe <strong>Félix Yván PAJARES SHIOZAWA</strong>, con DNI Nº <strong>18137108</strong>,
                    Director General del Instituto de Educación Superior Tecnológico Privado Valle Grande.
                  </p>

                  <div className="text-center mb-6">
                    <div
                      className="inline-block text-white px-8 py-3 font-bold text-lg"
                      style={{ backgroundColor: "#1f2937" }}
                    >
                      CONSTA
                    </div>
                  </div>

                  <p className="mb-6 text-justify">
                    Que el joven{" "}
                    <strong className="text-lg">
                      {(
                        selectedConstancia?.nombre_usuario ||
                        `${selectedConstancia?.nombres || ""} ${selectedConstancia?.apellidos || ""}`.trim() ||
                        "NOMBRE DEL ESTUDIANTE"
                      )?.toUpperCase()}
                    </strong>
                    , identificado con {selectedConstancia?.document_type || "DNI"} Nº{" "}
                    <strong>{selectedConstancia?.numero_documento || "XXXXXXXX"}</strong>, ha desarrollado el Proyecto
                    de Innovación:{" "}
                    <strong>
                      "{selectedConstancia?.proyecto_nombre || selectedConstancia?.nombre_evento || "PROYECTO"}"
                    </strong>
                    , desde el <strong>{formatDate(selectedConstancia?.fecha_inicio)}</strong> al{" "}
                    <strong>{formatDate(selectedConstancia?.fecha_fin)}</strong>, obteniendo un total de{" "}
                    <strong>{selectedConstancia?.cantidad_horas || 0} horas</strong>. Cabe precisar que dicho proyecto
                    forma parte de las actividades académicas del{" "}
                    <strong>
                      {selectedConstancia?.nombre_modulo?.toUpperCase() ||
                        selectedConstancia?.modulo_solicitado?.toUpperCase() ||
                        "MÓDULO TÉCNICO PROFESIONAL"}
                    </strong>
                    , de la Carrera de Análisis de Sistemas. El joven ha participado con empeño y eficiencia en las
                    siguientes labores:
                  </p>

                  <div className="mb-8">
                    <ul className="space-y-2 text-sm">
                      {selectedConstancia?.actividades ? (
                        selectedConstancia.actividades.split("\n").map((actividad, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>{actividad.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>
                              Análisis del modelo de negocio empleando las metodologías y herramientas: Business Model
                              Canvas, Design Thinking, diseño de proceso con BPMN e Historias de Usuario.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>Diseño del prototipo en Figma.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>
                              Versionamiento del código fuente con Git y GitHub, empleando el IDE de desarrollo VS Code.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>
                              Versionamiento del código fuente con Git y GitHub, empleando el IDE de desarrollo VS Code.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-3 mt-2">•</span>
                            <span>Tecnologías web empleadas: Html5 + CSS + JavaScript + MySQL.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <p className="mb-8 text-justify">Se expide la presente constancia a solicitud del interesado.</p>

                  <div className="flex justify-end mb-8">
                    <div
                      className="w-24 h-24 border-2 flex items-center justify-center"
                      style={{ borderColor: "#d1d5db", backgroundColor: "#f9fafb" }}
                    >
                      <div
                        className="w-20 h-20 flex items-center justify-center"
                        style={{ backgroundColor: "#e5e7eb" }}
                      >
                        <span className="text-xs" style={{ color: "#6b7280" }}>
                          QR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right mb-12">
                    <p className="font-medium">
                      Cañete,{" "}
                      {selectedConstancia?.fecha_emision
                        ? `${new Date(selectedConstancia.fecha_emision).getDate()} de ${getMonthInSpanish(new Date(selectedConstancia.fecha_emision))} del ${new Date(selectedConstancia.fecha_emision).getFullYear()}`
                        : `${new Date().getDate()} de ${getMonthInSpanish(new Date())} del ${getCurrentYear()}`}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-block">
                      <div className="w-80 border-b-2 mb-3" style={{ borderColor: "#1f2937" }}></div>
                      <div className="text-white px-6 py-2 mb-2" style={{ backgroundColor: "#1f2937" }}>
                        <p className="font-bold text-sm">FÉLIX YVÁN PAJARES SHIOZAWA</p>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "#4b5563" }}>
                        Director General
                      </p>
                      <div className="mt-4 text-xs" style={{ color: "#6b7280" }}>
                        <p>I.E.S.T. Privado Valle Grande</p>
                        <p>Resolución de Autorización de Funcionamiento RD Nº 1082-2006-ED</p>
                        <p>Antigua Panamericana Sur Km. 143 San Vicente de Cañete - Lima - Perú</p>
                        <p>Teléfono: (01) 581-2071 / Web: info@vallegrandeperu.edu.pe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <div
              className="p-6 flex justify-between items-center gap-4 rounded-b-2xl"
              style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
            >
              <div className="flex items-center gap-4 text-sm" style={{ color: "#4b5563" }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Documento generado automáticamente</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  style={{ backgroundColor: "#4b5563" }}
                >
                  <X className="w-4 h-4" />
                  Cerrar
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  style={{
                    backgroundColor: isDownloading ? "#9ca3af" : "#16a34a",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-delay-150 { animation-delay: 0.15s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

export default Solicitudes
