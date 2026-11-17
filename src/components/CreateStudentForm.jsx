import { useState } from 'react';
import { X } from 'lucide-react';
import userService from '../services/userService';

const CreateStudentForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    document_type: 'DNI',
    document_number: '',
    email: '',
    username: '',
    password: '',
    role: 'Estudiante',
    finalization_date: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones para campos obligatorios
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nombres son requeridos';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'Nombres deben tener al menos 2 caracteres';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Apellidos son requeridos';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Apellidos deben tener al menos 2 caracteres';
    }

    if (!formData.document_number.trim()) {
      newErrors.document_number = 'N° documento es requerido';
    } else if (!/^[0-9]+$/.test(formData.document_number)) {
      newErrors.document_number = 'Solo se permiten números';
    } else if (formData.document_number.length < 8) {
      newErrors.document_number = 'Documento debe tener al menos 8 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email no es válido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Usuario es requerido';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Usuario debe tener al menos 4 caracteres';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    // Validación solo si se proporciona fecha de finalización
    if (formData.finalization_date) {
      const selectedDate = new Date(formData.finalization_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.finalization_date = 'La fecha debe ser posterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const studentData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        document_type: formData.document_type,
        document_number: formData.document_number.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      };

      // Solo agregar finalization_date si tiene valor
      if (formData.finalization_date) {
        studentData.finalization_date = formData.finalization_date;
      }

      await userService.createStudent(studentData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating student:', error);
      setErrors({
        submit: error.message.includes('ORA-')
          ? 'Error en la base de datos. Por favor verifique los datos.'
          : 'Error al crear estudiante. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div
          className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500"
        >
          <h2
            className="text-2xl font-bold text-white "
          >Nuevo Estudiante</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-white transition-colors rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X
              className="w-6 h-6 "
            />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 "
        >
          {errors.submit && (
            <div
              className="p-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg "
            >
              {errors.submit}
            </div>
          )}

          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Nombres *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Ingrese los nombres"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.first_name ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.first_name && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.first_name}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Apellidos *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Ingrese los apellidos"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.last_name ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.last_name && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.last_name}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Tipo Documento *
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DNI">DNI</option>
                <option value="CNE">Carné Extranjería</option>
              </select>
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                N° Documento *
              </label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Ingrese el número de documento"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.document_number ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.document_number && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.document_number}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="ejemplo@correo.com"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.email && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Ingrese un nombre de usuario"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.username ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.username && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.username}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Mínimo 6 caracteres"
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.password ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.password && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.password}</p>
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Fecha de Finalización
              </label>
              <input
                type="date"
                name="finalization_date"
                value={formData.finalization_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`
                  w-full
                  px-4 py-3
                  text-gray-700
                  border rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.finalization_date ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.finalization_date && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >{errors.finalization_date}</p>
              )}
            </div>
          </div>

          <div
            className="flex justify-end pt-6 space-x-4 "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span
                  className="flex items-center justify-center "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2 -ml-1 animate-spin"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25 "
                    ></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75 "
                    ></path>
                  </svg>
                  Creando...
                </span>
              ) : (
                'Crear Estudiante'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentForm;
