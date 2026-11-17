"use client"

import { useState } from "react"
import { Upload, X, Download, AlertCircle, CheckCircle, FileText, Eye, Table } from "lucide-react"

const BulkUploadStudents = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const [periodoId, setPeriodoId] = useState(null)
  const [showFormatPreview, setShowFormatPreview] = useState(false)

  // Definir el formato exacto basado en tu método
  const requiredColumns = [
    { name: "username", description: "Nombre de usuario único", example: "ana.lopez", required: true },
    { name: "password", description: "Contraseña del usuario", example: "123456", required: true },
    { name: "nombres", description: "Nombres del estudiante", example: "Ana", required: true },
    { name: "apellidos", description: "Apellidos del estudiante", example: "López", required: true },
    { name: "correo", description: "Correo electrónico único", example: "ana.lopez@example.com", required: true },
    { name: "carrera_id", description: "ID de la carrera", example: "1", required: true },
    { name: "semestre_actual", description: "Semestre actual (1-6)", example: "1", required: true },
    { name: "curso_nombre", description: "Nombre del curso", example: "Matemática I", required: true },
    { name: "nota_final", description: "Nota final del curso (0-20)", example: "15", required: true },
    { name: "document_type", description: "Tipo de documento", example: "DNI", required: false },
    { name: "numero_documento", description: "Número de documento", example: "87654321", required: false }
  ]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
  
    if (!selectedFile) {
      setError("No se seleccionó ningún archivo.")
      setFile(null)
      return
    }
  
    console.log("Archivo seleccionado:", selectedFile.name, selectedFile.size)
  
    const allowedTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf("."))
  
    if (!allowedTypes.includes(fileExtension)) {
      setError("Formato de archivo no válido. Solo se permiten archivos CSV, XLSX o XLS.")
      setFile(null)
      return
    }
  
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError("El archivo es demasiado grande. Tamaño máximo: 10MB.")
      setFile(null)
      return
    }
  
    setFile(selectedFile)
    setError(null)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo.")
      return
    }

    if (!periodoId) {
      setError("ID de período requerido.")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Aquí iría tu userService.bulkUploadUsers
      // const result = await userService.bulkUploadUsers(file, periodoId)
      
      // Simulación para la demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      const result = {
        message: "Carga masiva completada exitosamente",
        resumen: {
          usuarios_creados: 3,
          usuarios_actualizados: 1,
          notas_creadas: 4,
          notas_actualizadas: 0,
          total_errores: 0
        }
      }
      
      console.log("Resultado de carga masiva:", result)
      setUploadResult(result)

      if (result.resumen) {
        onSuccess()
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Error al procesar el archivo")
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setUploadResult(null)
    setUploading(false)
    setPeriodoId(null)
    setShowFormatPreview(false)
    onClose()
  }

  const downloadTemplate = () => {
    const headers = requiredColumns.map(col => col.name)
    const sampleData = requiredColumns.map(col => col.example)

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "plantilla_estudiantes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Carga Masiva de Estudiantes</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!periodoId ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">ID del período académico</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Ej. 1"
                onChange={(e) => setPeriodoId(parseInt(e.target.value))}
              />
              <button
                onClick={() => {
                  if (!periodoId || isNaN(periodoId)) {
                    setError("Debes ingresar un ID de período válido.")
                  } else {
                    setError(null)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <>
              {/* Formato del archivo - Vista mejorada */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Formato Requerido del Archivo</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Tu archivo debe contener exactamente estas columnas en este orden:
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFormatPreview(!showFormatPreview)}
                    className="flex items-center space-x-2 px-3 py-1 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {showFormatPreview ? <Eye className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                    <span className="text-sm">{showFormatPreview ? 'Ocultar' : 'Ver'} Ejemplo</span>
                  </button>
                </div>

                {/* Lista de columnas */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requiredColumns.map((col, index) => (
                    <div key={col.name} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <code className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
                            {col.name}
                          </code>
                          {col.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Obligatorio
                            </span>
                          )}
                          {!col.required && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Opcional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{col.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vista previa de la tabla de ejemplo */}
                {showFormatPreview && (
                  <div className="mt-6 border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900">Vista Previa del Formato</h4>
                      <p className="text-xs text-blue-700">Así debe verse tu archivo CSV o Excel:</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            {requiredColumns.map((col) => (
                              <th key={col.name} className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-700">
                                {col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {requiredColumns.map((col) => (
                              <td key={col.name} className="border border-gray-200 px-2 py-2 text-gray-600">
                                {col.example}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">carlos.mendoza</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">123456</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">Carlos</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">Mendoza</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">carlos.mendoza@example.com</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">1</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">2</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">Programación Básica</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">17</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">DNI</td>
                            <td className="border border-gray-200 px-2 py-2 text-gray-600">88992233</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reglas importantes */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">⚠️ Reglas Importantes:</h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• El <strong>semestre_actual</strong> debe estar entre 1 y 6</li>
                    <li>• La <strong>nota_final</strong> debe estar entre 0 y 20</li>
                    <li>• El <strong>username</strong> y <strong>correo</strong> deben ser únicos</li>
                    <li>• La <strong>carrera_id</strong> debe existir en el sistema</li>
                    <li>• El <strong>curso_nombre</strong> debe existir en el sistema</li>
                  </ul>
                </div>
              </div>

              {/* Botón para descargar plantilla */}
              <div className="flex justify-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-6 py-3 text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar Plantilla con Formato Exacto</span>
                </button>
              </div>

              {/* Subir archivo */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar archivo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX o XLS (máx. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>

                {file && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null)
                        setError(null)
                        setUploadResult(null)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-900">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-900">Carga completada</h3>
                      <p className="text-sm text-green-700 mt-1">{uploadResult.message}</p>
                      {uploadResult.resumen && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium">Usuarios creados:</span> {uploadResult.resumen.usuarios_creados}</div>
                            <div><span className="font-medium">Usuarios actualizados:</span> {uploadResult.resumen.usuarios_actualizados}</div>
                            <div><span className="font-medium">Notas creadas:</span> {uploadResult.resumen.notas_creadas}</div>
                            <div><span className="font-medium">Notas actualizadas:</span> {uploadResult.resumen.notas_actualizadas}</div>
                          </div>
                          {uploadResult.resumen.total_errores > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-orange-800">
                                Errores encontrados: {uploadResult.resumen.total_errores}
                              </p>
                              {uploadResult.errores && (
                                <div className="mt-2 max-h-32 overflow-y-auto">
                                  <ul className="text-xs text-orange-700 space-y-1">
                                    {uploadResult.errores.map((error, index) => (
                                      <li key={index}>• {error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" disabled={uploading}>
            Cancelar
          </button>
          {periodoId && (
            <button onClick={handleUpload} disabled={!file || uploading} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Subir Archivo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkUploadStudents