import { useState, useEffect } from "react";
import { X } from "lucide-react";
import userService from "../services/userService";

const EditStudentForm = ({ isOpen, studentData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    document_type: "DNI",
    document_number: "",
    email: "",
    username: "",
    finalization_date: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentData && isOpen) {
      // Formatear la fecha correctamente si existe
      let formattedDate = "";
      if (studentData.finalization_date) {
        const date = new Date(studentData.finalization_date);
        formattedDate = date.toISOString().split('T')[0];
      }

      setFormData({
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        document_type: studentData.document_type || "DNI",
        document_number: studentData.document_number || "",
        email: studentData.email || "",
        username: studentData.username || "",
        finalization_date: formattedDate,
      });
    }
  }, [studentData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario escribe
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

    // Validación de nombres y apellidos
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Nombres son requeridos";
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = "Nombres deben tener al menos 2 caracteres";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Apellidos son requeridos";
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = "Apellidos deben tener al menos 2 caracteres";
    }

    // Validación de documento
    if (!formData.document_number.trim()) {
      newErrors.document_number = "N° documento es requerido";
    } else if (!/^[0-9]+$/.test(formData.document_number)) {
      newErrors.document_number = "Solo se permiten números";
    } else if (formData.document_number.length < 8) {
      newErrors.document_number = "Documento debe tener al menos 8 dígitos";
    }

    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no es válido";
    }

    // Validación de usuario
    if (!formData.username.trim()) {
      newErrors.username = "Usuario es requerido";
    } else if (formData.username.length < 4) {
      newErrors.username = "Usuario debe tener al menos 4 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        document_type: formData.document_type,
        document_number: formData.document_number.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        finalization_date: formData.finalization_date || null
      };

      await userService.updateStudentPartial(studentData.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      setErrors({
        submit: error.message.includes('ORA-32796')
          ? 'Error: Configuración de base de datos'
          : 'Error al actualizar el estudiante. Por favor, intente nuevamente.'
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
          className="flex items-center justify-between px-6 py-4 border-b "
        >
          <h2
            className="text-xl font-semibold "
          >Editar Estudiante</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X
              className="w-5 h-5 "
            />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 "
        >
          {errors.submit && (
            <div
              className="p-3 text-red-700 bg-red-100 rounded-md "
            >
              {errors.submit}
            </div>
          )}

          <div>
            <label
              className="block mb-1 text-sm font-medium text-gray-700 "
            >
              Nombres *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`
                w-full
                px-3 py-2
                border rounded-md
                ${errors.first_name ? "border-red-500" : "border-gray-300"}
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
              className="block mb-1 text-sm font-medium text-gray-700 "
            >
              Apellidos *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`
                w-full
                px-3 py-2
                border rounded-md
                ${errors.last_name ? "border-red-500" : "border-gray-300"}
              `}
            />
            {errors.last_name && (
              <p
                className="mt-1 text-sm text-red-600 "
              >{errors.last_name}</p>
            )}
          </div>

          <div
            className="grid grid-cols-2 gap-4 "
          >
            <div>
              <label
                className="block mb-1 text-sm font-medium text-gray-700 "
              >
                Tipo Documento *
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md "
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carné Extranjería</option>
              </select>
            </div>

            <div>
              <label
                className="block mb-1 text-sm font-medium text-gray-700 "
              >
                N° Documento *
              </label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`
                  w-full
                  px-3 py-2
                  border rounded-md
                  ${errors.document_number ? "border-red-500" : "border-gray-300"}
                `}
              />
              {errors.document_number && (
                <p
                  className="mt-1 text-sm text-red-600 "
                >
                  {errors.document_number}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              className="block mb-1 text-sm font-medium text-gray-700 "
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`
                w-full
                px-3 py-2
                border rounded-md
                ${errors.email ? "border-red-500" : "border-gray-300"}
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
              className="block mb-1 text-sm font-medium text-gray-700 "
            >
              Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`
                w-full
                px-3 py-2
                border rounded-md
                ${errors.username ? "border-red-500" : "border-gray-300"}
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
              className="block mb-1 text-sm font-medium text-gray-700 "
            >
              Fecha de Finalización
            </label>
            <input
              type="date"
              name="finalization_date"
              value={formData.finalization_date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md "
            />
          </div>

          <div
            className="flex justify-end pt-4 space-x-3 "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentForm;
