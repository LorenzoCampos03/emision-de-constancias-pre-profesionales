import React, { useState, useRef } from 'react';
import { X, Download, Printer, Eye, FileText, Calendar, Clock, User, Award, Building } from 'lucide-react';
import logoVallegrande from '../assets/vallegrande.png';
import html2pdf from 'html2pdf.js';

const ConstanciaPreview = ({ constancia, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const documentRef = useRef();

  if (!constancia) return null;

  console.log("🔍 ESTADO RECIBIDO:", constancia.estado)
  console.log("🔍 CONSTANCIA COMPLETA:", constancia)

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';

    let date;
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date)) return 'Fecha inválida';

    const day = date.getDate();
    const month = date.toLocaleString('es-PE', { month: 'short' }).toLowerCase();
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // Función para obtener el año actual
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // Función para obtener el mes en español
  const getMonthInSpanish = (date) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[date.getMonth()];
  };

  const handlePrint = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.print();
      setIsLoading(false);
    }, 500);
  };

  const handleDownload = async () => {
    setIsLoading(true);
  
    try {
      const element = documentRef.current;
  
      const opt = {
        margin:       0.5,
        filename:     `constancia_${constancia.nombre_usuario || 'documento'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
  
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay principal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        {/* Modal container */}
        <div
          className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${showFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[95vh]'
            }`}
        >
          {/* Header del modal */}
          <div className="text-white p-6 flex items-center justify-between rounded-t-2xl" style={{ background: 'linear-gradient(to right, #1d4ed8, #1e40af)' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Vista Previa de Constancia</h2>
                <p className="text-sm" style={{ color: '#bfdbfe' }}>Instituto Valle Grande - Documento Oficial</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullscreen(!showFullscreen)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Pantalla completa"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Información del estudiante */}
          <div className="p-4 flex-wrap" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#2563eb' }} />
                <span className="font-medium">Estudiante:</span>
                <span style={{ color: '#374151' }}>{constancia.nombre_usuario || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#16a34a' }} />
                <span className="font-medium">Periodo:</span>
                <span style={{ color: '#374151' }}>{formatDate(constancia.fecha_inicio)} / {formatDate(constancia.fecha_fin)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#9333ea' }} />
                <span className="font-medium">Horas:</span>
                <span style={{ color: '#374151' }}>{constancia.cantidad_horas}h</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: '#ea580c' }} />
                <span className="font-medium">Estado:</span>
                <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor:
                  constancia.estado_solicitud?.toLowerCase() === "aceptado"
                    ? "#dcfce7"
                    : constancia.estado_solicitud?.toLowerCase() === "pendiente"
                      ? "#fef3c7"
                      : "#fee2e2",
                color:
                  constancia.estado_solicitud?.toLowerCase() === "aceptado"
                    ? "#166534"
                    : constancia.estado_solicitud?.toLowerCase() === "pendiente"
                      ? "#92400e"
                      : "#991b1b",
              }}
            >
              {constancia.estado_solicitud?.toLowerCase() === "aceptado"
                ? "Aceptado"
                : constancia.estado_solicitud?.toLowerCase() === "pendiente"
                  ? "Pendiente"
                  : constancia.estado_solicitud?.toLowerCase() === "rechazado"
                    ? "Rechazado"
                    : constancia.estado_solicitud || "N/A"}
            </span>
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div
              ref={documentRef}
              className="p-8 bg-white max-w-4xl mx-auto"
              style={{
                fontFamily: 'Times New Roman, serif',
                lineHeight: '1.6',
                color: '#1a1a1a'
              }}
            >
              {/* Header del documento con logo y escudo */}
              <div className="text-center mb-8 relative">
                {/* Línea decorativa superior */}
                <div className="w-full h-1 rounded-full mb-6" style={{ backgroundColor: '#1d4ed8' }}></div>

                {/* Logo y escudo */}
                <div className="flex justify-center items-center mb-4">
                  <div className="w-30 h-30 overflow-hidden flex items-center justify-center">
                    <img
                      src={logoVallegrande || "/placeholder.svg"}
                      alt="Logo Valle Grande"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* Ícono alternativo si falla la imagen */}
                    <div className="hidden">
                      <Building className="w-12 h-12" style={{ color: '#16a34a' }} />
                    </div>
                  </div>
                </div>

                {/* Nombre de la institución */}
                <div className="mb-4">
                  <p className="text-sm italic mb-4" style={{ color: '#4b5563' }}>"Año del Fortalecimiento de la Soberanía Nacional"</p>
                </div>

                {/* Título principal */}
                <div className="border-2 p-4 mb-4" style={{ borderColor: '#1f2937', backgroundColor: '#f9fafb' }}>
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#1f2937' }}>
                    CONSTANCIA DE PRÁCTICAS PRE – PROFESIONALES
                  </h2>
                  <div className="text-white py-2 px-4 mx-4" style={{ backgroundColor: '#1f2937' }}>
                    <h3 className="text-base font-bold">
                      MÓDULO TÉCNICO PROFESIONAL Nº 01
                    </h3>
                  </div>
                  <p className="text-lg font-bold mt-2" style={{ color: '#1f2937' }}>
                    "{constancia.nombre_certificacion || 'Soporte Técnico y Ofimático'}"
                  </p>
                </div>
              </div>

              {/* Cuerpo del documento */}
              <div className="text-justify leading-relaxed text-base">
                {/* Párrafo de presentación */}
                <p className="mb-6">
                  El que suscribe <strong>Félix Yván PAJARES SHIOZAWA</strong>, con DNI Nº <strong>18137108</strong>,
                  Director General del Instituto de Educación Superior Tecnológico Privado Valle Grande.
                </p>

                {/* CONSTA */}
                <div className="text-center mb-6">
                  <div className="inline-block text-white px-8 py-3 font-bold text-lg" style={{ backgroundColor: '#1f2937' }}>
                    CONSTA
                  </div>
                </div>

                {/* Párrafo principal */}
                <p className="mb-6 text-justify">
                  Que el joven <strong className="text-lg">{constancia.nombre_usuario?.toUpperCase() || 'NOMBRE DEL ESTUDIANTE'}</strong>,
                  identificado con {constancia.document_type || 'DNI'} Nº <strong>{constancia.numero_documento || 'XXXXXXXX'}</strong>,
                  ha desarrollado el Proyecto de Innovación: <strong>"{constancia.proyecto_nombre || constancia.nombre_evento}"</strong>,
                  desde el <strong>{formatDate(constancia.fecha_inicio)}</strong> al <strong>{formatDate(constancia.fecha_fin)}</strong>,
                  obteniendo un total de <strong>{constancia.cantidad_horas} horas</strong>. Cabe precisar que dicho proyecto forma parte
                  de las actividades académicas del <strong>{constancia.nombre_modulo?.toUpperCase() || 'MÓDULO TÉCNICO PROFESIONAL'}</strong>,
                  de la Carrera de Análisis de Sistemas. El joven ha participado con empeño y eficiencia en las siguientes labores:
                </p>

                {/* Lista de actividades */}
                <div className="mb-8">
                  <ul className="space-y-2 text-sm">
                    {constancia.actividades ? (
                      constancia.actividades.split('\n').map((actividad, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>{actividad.trim()}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Análisis del modelo de negocio empleando las metodologías y herramientas: Business Model Canvas, Design Thinking, diseño de proceso con BPMN e Historias de Usuario.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Diseño del prototipo en Figma.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Versionamiento del código fuente con Git y GitHub, empleando el IDE de desarrollo VS Code.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Tecnologías web empleadas: Html5 + CSS + JavaScript + MySQL.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Análisis, diseño e implementación de la Base de Datos en MySQL.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Interacción de la base de datos MySQL con la landing page a través de Api Rest con Node JS para el mantenimiento de una tabla maestra.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-3 mt-2">•</span>
                          <span>Implementación del Servidor Web con NodeJS, Express, MySQL en la plataforma cloud de AWS, utilizando los Sistemas Operativos UBUNTU Server y DEBIAN.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Párrafo final */}
                <p className="mb-8 text-justify">
                  Se expide la presente constancia a solicitud del interesado.
                </p>

                {/* Código QR placeholder */}
                <div className="flex justify-end mb-8">
                  <div className="w-24 h-24 border-2 flex items-center justify-center" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
                    <div className="w-20 h-20 flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
                      <span className="text-xs" style={{ color: '#6b7280' }}>QR</span>
                    </div>
                  </div>
                </div>

                {/* Fecha y lugar */}
                <div className="text-right mb-12">
                  <p className="font-medium">
                    Cañete, {constancia.fecha_emision ?
                      `${new Date(constancia.fecha_emision).getDate()} de ${getMonthInSpanish(new Date(constancia.fecha_emision))} del ${new Date(constancia.fecha_emision).getFullYear()}` :
                      `${new Date().getDate()} de ${getMonthInSpanish(new Date())} del ${getCurrentYear()}`
                    }
                  </p>
                </div>

                {/* Firma */}
                <div className="text-center">
                  <div className="inline-block">
                    <div className="w-80 border-b-2 mb-3" style={{ borderColor: '#1f2937' }}></div>
                    <div className="text-white px-6 py-2 mb-2" style={{ backgroundColor: '#1f2937' }}>
                      <p className="font-bold text-sm">FÉLIX YVÁN PAJARES SHIOZAWA</p>
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#4b5563' }}>Director General</p>
                    <div className="mt-4 text-xs" style={{ color: '#6b7280' }}>
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
          <div className="p-6 flex justify-between items-center gap-4 rounded-b-2xl flex-wrap" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <div className="flex items-center gap-4 text-sm" style={{ color: '#4b5563' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Documento generado automáticamente</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#4b5563' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                style={{ 
                  backgroundColor: isLoading ? '#9ca3af' : '#16a34a',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#15803d')}
                onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#16a34a')}
              >
                {isLoading ? (
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

              <button
                onClick={handlePrint}
                disabled={isLoading}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                style={{ 
                  backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#1d4ed8')}
                onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#2563eb')}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConstanciaPreview;