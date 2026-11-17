"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth()
  const location = useLocation()

  // Si no hay usuario o token, redirigir al login
  if (!user || !token) {
    // Guardamos la ruta a la que quería acceder para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si está autenticado, mostrar el contenido
  return children
}

export default ProtectedRoute
