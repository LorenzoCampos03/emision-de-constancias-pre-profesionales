import { useState, useEffect } from 'react';
import { X, AlertCircle, User, FileText, Calendar, Hash } from 'lucide-react';
import constanciaService from '../services/constanciaService';

const ConstanciaForm = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_evento: '',
    nombre_certificacion: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_horas: '',
    proyecto_nombre: '',
    actividades: '',
    estado: 'Pendiente' // Estado por defecto
  });

  // Datos del usuario que no se pueden modificar
  const [userInfo, setUserInfo] = useState({
    nombre_usuario: '',
    document_type: '',
    numero_documento: '',
    user_id: '',
    solicitud_id: '',
    constancia_id: '',
    nombre_modulo: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados disponibles para el select
  const estadosDisponibles = [
    { value: 'Pendiente', label: 'Pendiente', color: 'text-yellow-600' },
    { value: 'Aceptado', label: 'Aceptado', color: 'text-green-600' },
    { value: 'Rechazado', label: 'Rechazado', color: 'text-red-600' }
  ];

  // Manejar datos iniciales o resetear formulario
  useEffect(() => {
    if (initialData) {
      // Convertir fechas del formato DD/MM/YYYY a YYYY-MM-DD para inputs de fecha
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        // Si la fecha ya viene en formato YYYY-MM-DD, la devolvemos tal como está
        if (dateStr.includes('-') && dateStr.length === 10) return dateStr;
        // Si viene en formato DD/MM/YYYY, la convertimos
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr;
      };

      // Datos editables del formulario
      setFormData({
        nombre_evento: initialData.nombre_evento || '',
        nombre_certificacion: initialData.nombre_certificacion || '',
        descripcion: initialData.descripcion || '',
        fecha_inicio: formatDateForInput(initialData.fecha_inicio),
        fecha_fin: formatDateForInput(initialData.fecha_fin),
        cantidad_horas: initialData.cantidad_horas?.toString() || '',
        proyecto_nombre: initialData.proyecto_nombre || '',
        actividades: initialData.actividades || '',
        estado: initialData.estado || 'Pendiente'
      });

      // Datos del usuario y otros campos no editables
      setUserInfo({
        nombre_usuario: initialData.nombre_usuario || '',
        document_type: initialData.document_type || '',
        numero_documento: initialData.numero_documento || '',
        user_id: initialData.user_id || '',
        solicitud_id: initialData.solicitud_id || '',
        constancia_id: initialData.constancia_id || '',
        nombre_modulo: initialData.nombre_modulo || ''
      });
    } else if (!isOpen) {
      // Resetear formulario cuando se cierra el modal
      setFormData({
        nombre_evento: '',
        nombre_certificacion: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        cantidad_horas: '',
        proyecto_nombre: '',
        actividades: '',
        estado: 'Pendiente'
      });
      setUserInfo({
        nombre_usuario: '',
        document_type: '',
        numero_documento: '',
        user_id: '',
        solicitud_id: '',
        constancia_id: '',
        nombre_modulo: ''
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validación en tiempo real para fechas
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      validateDateRange(name, value);
    }
  };

  const validateDateRange = (changedField, newValue) => {
    const fechaInicio = changedField === 'fecha_inicio' ? newValue : formData.fecha_inicio;
    const fechaFin = changedField === 'fecha_fin' ? newValue : formData.fecha_fin;

    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      setErrors(prev => ({
        ...prev,
        fecha_fin: 'La fecha de fin debe ser posterior a la fecha de inicio'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fecha_fin;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.nombre_evento.trim()) {
      newErrors.nombre_evento = 'El nombre del evento es requerido';
    }

    if (!formData.nombre_certificacion.trim()) {
      newErrors.nombre_certificacion = 'El nombre de la certificación es requerido';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    // Validación de rango de fechas
    if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio > formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Validación de cantidad de horas
    const horas = parseInt(formData.cantidad_horas);
    if (!formData.cantidad_horas || isNaN(horas) || horas <= 0) {
      newErrors.cantidad_horas = 'La cantidad de horas debe ser un número mayor a 0';
    }

    // Validación de estado
    if (!formData.estado) {
      newErrors.estado = 'Debe seleccionar un estado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convertir fechas de YYYY-MM-DD a DD/MM/YYYY para el backend
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      const dataToSend = {
        ...formData,
        fecha_inicio: formData.fecha_inicio, // <-- sin formato
        fecha_fin: formData.fecha_fin,
        cantidad_horas: parseInt(formData.cantidad_horas),
        user_id: parseInt(userInfo.user_id),
        solicitud_id: userInfo.solicitud_id
      };
      if (initialData && userInfo.constancia_id) {
        await constanciaService.updateConstancia(userInfo.constancia_id, dataToSend);
      } else {
        await constanciaService.createConstancia(dataToSend);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar constancia:', error);
      setErrors({ 
        submit: error.message || 'Error al guardar la constancia. Intente nuevamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Editar Constancia' : 'Nueva Constancia'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {initialData 
                ? `Modificando constancia #${userInfo.constancia_id}` 
                : 'Complete todos los campos requeridos para crear la constancia'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error general */}
            {errors.submit && (
              <div className="flex items-center gap-3 px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Información del Usuario (Solo lectura) */}
            {initialData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Estudiante</p>
                      <p className="font-medium text-gray-900">{userInfo.nombre_usuario || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                      <p className="font-medium text-gray-900">
                        {userInfo.document_type} - {userInfo.numero_documento}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">ID Constancia</p>
                      <p className="font-medium text-gray-900">{userInfo.constancia_id}</p>
                    </div>
                  </div>
                  {userInfo.nombre_modulo && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Módulo</p>
                        <p className="font-medium text-gray-900">{userInfo.nombre_modulo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información básica - Campos editables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nombre del Evento */}
              <div className="lg:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  name="nombre_evento"
                  value={formData.nombre_evento}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.nombre_evento ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Ingrese el nombre del evento"
                />
                {errors.nombre_evento && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nombre_evento}
                  </p>
                )}
              </div>

              {/* Nombre de la Certificación */}
              <div className="lg:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre de la Certificación *
                </label>
                <input
                  type="text"
                  name="nombre_certificacion"
                  value={formData.nombre_certificacion}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.nombre_certificacion ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Ingrese el nombre de la certificación"
                />
                {errors.nombre_certificacion && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nombre_certificacion}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.estado ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {estadosDisponibles.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                {errors.estado && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.estado}
                  </p>
                )}
              </div>

              {/* Cantidad de Horas */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Cantidad de Horas *
                </label>
                <input
                  type="number"
                  name="cantidad_horas"
                  value={formData.cantidad_horas}
                  onChange={handleChange}
                  min="1"
                  max="9999"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.cantidad_horas ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Ej: 40"
                />
                {errors.cantidad_horas && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cantidad_horas}
                  </p>
                )}
              </div>

              {/* Fechas */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.fecha_inicio ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.fecha_inicio && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha_inicio}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.fecha_fin ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.fecha_fin && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha_fin}
                  </p>
                )}
              </div>

              {/* Nombre del Proyecto */}
              <div className="lg:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  name="proyecto_nombre"
                  value={formData.proyecto_nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                  placeholder="Ingrese el nombre del proyecto"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors resize-none"
                placeholder="Ingrese una descripción detallada del evento o certificación"
              />
            </div>

            {/* Actividades */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Actividades Realizadas
              </label>
              <textarea
                name="actividades"
                value={formData.actividades}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors resize-none"
                placeholder="Describa las actividades realizadas durante el evento"
              />
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            * Campos requeridos
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                initialData ? 'Actualizar Constancia' : 'Crear Constancia'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstanciaForm;