"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
  Users,
  Search,
  Download,
} from "lucide-react"
import html2pdf from "html2pdf.js"

import userService from "../services/userService"
import CreateStudentForm from "./CreateStudentForm"
import EditStudentForm from "./EditStudentForm"
import BulkUploadStudents from "./BulkUploadStudents"

const ListaEstudiantes = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [animationStage, setAnimationStage] = useState(0)

  // Estados para el reporte
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const reportRef = useRef()

  // Separate filter states
  const [filterStudentCode, setFilterStudentCode] = useState("")
  const [filterYearAdmission, setFilterYearAdmission] = useState("")
  const [filterAdmissionCycle, setFilterAdmissionCycle] = useState("")
  const [filterSemester, setFilterSemester] = useState("")
  const [filterDocumentNumber, setFilterDocumentNumber] = useState("")
  const [filterEmail, setFilterEmail] = useState("")

  const itemsPerPage = 10

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

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    date.setHours(date.getHours() + 5)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await userService.getStudents(showInactive)
      console.log("Datos recibidos:", data)
      setStudents(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleCreateNew = () => {
    setSelectedStudent(null)
    setIsFormOpen(true)
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = async (id) => {
    alert(`Botón clickeado! ID: ${id}`) // AGREGAR ESTA LÍNEA
    if (window.confirm("¿Está seguro de eliminar este estudiante?")) {
      try {
        console.log("🗑️ Eliminando estudiante con ID:", id)
        const result = await userService.deleteStudent(id)
        console.log("✅ Resultado de eliminación:", result)
        await loadStudents()
      } catch (error) {
        console.error("Error al eliminar estudiante:", error)
        alert("Error al eliminar el estudiante: " + error.message)
      }
    }
  }

  const handleReactivate = async (id) => {
    if (window.confirm("¿Está seguro de reactivar este estudiante?")) {
      try {
        await userService.reactivateStudent(id)
        await loadStudents()
      } catch (error) {
        console.error("Error al reactivar estudiante:", error)
        alert("Error al reactivar el estudiante: " + error.message)
      }
    }
  }

  const handleFormSuccess = () => {
    loadStudents()
    setIsFormOpen(false)
  }

  const toggleView = () => {
    setShowInactive(!showInactive)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilterStudentCode("")
    setFilterYearAdmission("")
    setFilterAdmissionCycle("")
    setFilterSemester("")
    setFilterDocumentNumber("")
    setFilterEmail("")
    setCurrentPage(1)
  }

  // Función para generar reporte PDF
  const generatePDFReport = async () => {
    setIsGeneratingReport(true)

    try {
      const element = reportRef.current

      const opt = {
        margin: 0.5,
        filename: "Estudiantes_2025.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      A: {
        label: "A",
        className: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm",
      },
      I: {
        label: "I",
        className: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200 shadow-sm",
      },
    }

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border border-slate-200 shadow-sm",
    }

    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full ${config.className} hover:scale-105 transition-transform duration-200`}
      >
        {config.label}
      </span>
    )
  }

  const filteredStudents = students
    .filter((student) => {
      // Filter by status (active/inactive)
      const matchesStatus = showInactive ? student.estado === "I" : student.estado === "A"

      // Filter by individual fields
      const matchesStudentCode =
        filterStudentCode === "" ||
        (student.codigo_alumno &&
          student.codigo_alumno.toString().toLowerCase().includes(filterStudentCode.toLowerCase()))

      const matchesYearAdmission =
        filterYearAdmission === "" ||
        (student.anio_ingreso && student.anio_ingreso.toString().includes(filterYearAdmission))

      const matchesAdmissionCycle =
        filterAdmissionCycle === "" ||
        (student.ciclo_ingreso &&
          student.ciclo_ingreso.toString().toLowerCase().includes(filterAdmissionCycle.toLowerCase()))

      const matchesSemester =
        filterSemester === "" ||
        (student.semestre_actual && student.semestre_actual.toString().includes(filterSemester))

      const matchesDocumentNumber =
        filterDocumentNumber === "" ||
        (student.numero_documento && student.numero_documento.includes(filterDocumentNumber))

      const matchesEmail =
        filterEmail === "" || (student.correo && student.correo.toLowerCase().includes(filterEmail.toLowerCase()))

      return (
        matchesStatus &&
        matchesStudentCode &&
        matchesYearAdmission &&
        matchesAdmissionCycle &&
        matchesSemester &&
        matchesDocumentNumber &&
        matchesEmail
      )
    })
    .sort((a, b) => {
      const lastNameCompare = (a.apellidos || "").localeCompare(b.apellidos || "")
      if (lastNameCompare !== 0) return lastNameCompare
      return (a.nombres || "").localeCompare(b.nombres || "")
    })

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

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
            <p className="text-slate-500 animate-bounce">Cargando estudiantes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={loadStudents}
                className="mt-2 text-red-600 hover:text-red-800 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all"
              >
                Reintentar
              </button>
            </div>
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

      {/* Tabla oculta para generar PDF */}
      <div className="hidden">
        <div
          ref={reportRef}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            padding: "20px",
            backgroundColor: "#ffffff",
            color: "#000000",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "10px",
              }}
            >
              Reporte de Estudiantes
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "5px" }}>
              Instituto Valle Grande - {new Date().toLocaleDateString()}
            </p>
            <p style={{ color: "#6b7280" }}>
              Mostrando estudiantes {showInactive ? "inactivos" : "activos"} - Total: {filteredStudents.length}{" "}
              registros
            </p>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #d1d5db",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  #
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Nombres
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Apellidos
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Código
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Año Ingreso
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Ciclo Ingreso
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Semestre
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Tipo Doc.
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  N° Documento
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Email
                </th>
                <th style={{ border: "1px solid #d1d5db", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.user_id || student.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{index + 1}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.nombres || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.apellidos || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.codigo_alumno || "-"}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.anio_ingreso || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.ciclo_ingreso || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.semestre_actual || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.document_type || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.numero_documento || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>{student.correo || ""}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "6px" }}>
                    {student.estado === "A" ? "Activo" : "Inactivo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="relative z-10 space-y-8 p-4 sm:p-6 max-w-full mx-auto">
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
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Lista de Estudiantes
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-lg">
                      Gestiona los estudiantes registrados en el sistema
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={toggleView}
                  className={`relative z-20 px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center space-x-2 sm:space-x-3 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    showInactive
                      ? "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                  }`}
                >
                  {showInactive ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="text-sm sm:text-base">{showInactive ? "Ver Activos" : "Ver Inactivos"}</span>
                </button>

                <button
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="relative z-20 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">UPLOAD STUDENTS</span>
                </button>

                {/* Botón de Reporte PDF */}
                <button
                  onClick={generatePDFReport}
                  disabled={isGeneratingReport || filteredStudents.length === 0}
                  className="relative z-20 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Descargar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Separate Filters */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${animationStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full text-white">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Filtros de Búsqueda</h3>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Encuentra estudiantes específicos usando los filtros
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={clearAllFilters}
                  className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-500 to-gray-600 text-white font-bold rounded-xl hover:from-slate-600 hover:to-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Código de Estudiante</label>
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={filterStudentCode}
                  onChange={(e) => {
                    setFilterStudentCode(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Año de Ingreso</label>
                <input
                  type="text"
                  placeholder="Buscar por año..."
                  value={filterYearAdmission}
                  onChange={(e) => {
                    setFilterYearAdmission(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ciclo de Ingreso</label>
                <input
                  type="text"
                  placeholder="Buscar por ciclo..."
                  value={filterAdmissionCycle}
                  onChange={(e) => {
                    setFilterAdmissionCycle(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Semestre</label>
                <input
                  type="text"
                  placeholder="Buscar por semestre..."
                  value={filterSemester}
                  onChange={(e) => {
                    setFilterSemester(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">N° Documento</label>
                <input
                  type="text"
                  placeholder="Buscar por documento..."
                  value={filterDocumentNumber}
                  onChange={(e) => {
                    setFilterDocumentNumber(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={filterEmail}
                  onChange={(e) => {
                    setFilterEmail(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de vista actual */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${animationStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div
            className={`rounded-xl p-4 border-2 shadow-lg ${
              showInactive
                ? "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200"
                : "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${showInactive ? "bg-rose-100" : "bg-emerald-100"}`}>
                  {showInactive ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  )}
                </div>
                <span
                  className={`font-bold text-sm sm:text-base ${showInactive ? "text-rose-700" : "text-emerald-700"}`}
                >
                  Mostrando estudiantes {showInactive ? "inactivos" : "activos"}
                </span>
              </div>

              <span
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${
                  showInactive ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {filteredStudents.length} registro{filteredStudents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Responsive */}
        <div
          className={`transform transition-all duration-1000 delay-400 ${animationStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm table-auto min-w-[800px]">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      #
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Nombres
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Apellidos
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Código
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Año Ingreso
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Ciclo Ingreso
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Semestre
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Tipo Doc.
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      N° Documento
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Estado
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-left whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                        <div className="space-y-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-slate-600">
                              {showInactive ? "No hay estudiantes inactivos" : "No hay estudiantes activos"}
                            </p>
                            <p className="text-slate-500 text-xs sm:text-sm">
                              Los registros aparecerán aquí cuando estén disponibles
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((student, index) => (
                      <tr
                        key={student.user_id || student.id}
                        className="hover:bg-white/80 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-slate-900 whitespace-nowrap">
                          {startIndex + index + 1}
                        </td>
                        <td
                          className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium max-w-[120px] truncate"
                          title={student.nombres}
                        >
                          {student.nombres}
                        </td>
                        <td
                          className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium max-w-[120px] truncate"
                          title={student.apellidos}
                        >
                          {student.apellidos}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-mono font-bold whitespace-nowrap">
                          {student.codigo_alumno || "-"}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 whitespace-nowrap">
                          {student.anio_ingreso}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 whitespace-nowrap">
                          {student.ciclo_ingreso}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 whitespace-nowrap">
                          {student.semestre_actual}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 whitespace-nowrap">
                          {student.document_type}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-mono whitespace-nowrap">
                          {student.numero_documento}
                        </td>
                        <td
                          className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 max-w-[150px] truncate"
                          title={student.correo}
                        >
                          {student.correo}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          {getStatusBadge(student.estado)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <div className="flex space-x-1 sm:space-x-2">
                            {student.estado === "A" ? (
                              <button
                                onClick={() => handleDelete(student.user_id || student.id)}
                                title="Eliminar"
                                className="p-1 sm:p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-110 group-hover:scale-105"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(student.user_id || student.id)}
                                title="Reactivar"
                                className="p-1 sm:p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-110 group-hover:scale-105"
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-slate-700 text-center sm:text-left">
                    Mostrando <span className="font-bold">{startIndex + 1}</span> a{" "}
                    <span className="font-bold">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</span> de{" "}
                    <span className="font-bold">{filteredStudents.length}</span> resultados
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    <span className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold shadow-md text-xs sm:text-sm">
                      {currentPage} de {totalPages}
                    </span>

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

        {/* MODALES - EXACTAMENTE IGUAL QUE EL ORIGINAL */}
        {isFormOpen &&
          (selectedStudent ? (
            <EditStudentForm
              isOpen={isFormOpen}
              studentData={selectedStudent}
              onClose={() => setIsFormOpen(false)}
              onSuccess={handleFormSuccess}
            />
          ) : (
            <CreateStudentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={handleFormSuccess} />
          ))}

        {isBulkUploadOpen && (
          <BulkUploadStudents
            isOpen={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            onSuccess={() => {
              loadStudents()
              setIsBulkUploadOpen(false)
            }}
            periodoId={1} // You may want to make this dynamic based on your application logic
          />
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

export default ListaEstudiantes
