"use client"

import { useState } from "react"

import {
  Home,
  FileText,
  User,
  LogOut,
  Bell,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Menu,
  ChevronDown,
  Settings,
  BookOpen,
  Code,
} from "lucide-react"

import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"

import { useAuth } from "../../context/AuthContext"

import { useNotifications } from "../../hooks/useNotifications2"

const LayoutEstudiante = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState(() => {
    const path = location.pathname
    if (path === "/estudiante") return "inicio"
    if (path === "/estudiante/solicitudes") return "solicitudes"
    return "inicio"
  })

  const { user, logout } = useAuth()

  // 🆕 ACTUALIZADO: Pasar parámetros correctos al hook
  const { notifications, unreadCount, markAsRead } = useNotifications(
    user?.user_id,
    "ESTUDIANTE", // Tipo de usuario
  )

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // 🔔 Función para manejar click en notificaciones - ACTUALIZADA
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications && unreadCount > 0) {
      // 🆕 Marcar TODAS las notificaciones como leídas cuando se abra el panel
      markAsRead()
    }
  }

  // 🔔 Función para formatear tiempo relativo
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Hace un momento"
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    if (diffInMinutes < 1) return "Hace un momento"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  // 🔔 Función para obtener el ícono según el tipo de notificación
  const getNotificationIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case "aprobado":
      case "aprobada":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case "rechazado":
      case "rechazada":
        return <XCircle className="w-4 h-4 text-rose-600" />
      default:
        return <FileText className="w-4 h-4 text-blue-600" />
    }
  }

  // 🔔 Función para obtener el color de fondo según el tipo
  const getNotificationBgColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "aprobado":
      case "aprobada":
        return "bg-gradient-to-r from-emerald-50 to-green-50"
      case "rechazado":
      case "rechazada":
        return "bg-gradient-to-r from-rose-50 to-red-50"
      default:
        return "bg-gradient-to-r from-blue-50 to-indigo-50"
    }
  }

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: Home, path: "/estudiante", gradient: "from-blue-500 to-purple-600" },
    {
      id: "solicitudes",
      label: "Mis Solicitudes",
      icon: FileText,
      path: "/estudiante/solicitudes",
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Sidebar Mejorado */}
      <div className={`${sidebarCollapsed ? "w-20" : "w-80"} transition-all duration-500 ease-in-out relative z-10`}>
        <div className="h-full bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
              </div>
              {!sidebarCollapsed && (
                <div className="animate-fade-in">
                  <div className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    CertiPro
                  </div>
                  <div className="text-sm text-slate-500 font-medium">Portal Estudiante</div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-100/50">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-4"}`}>
              <div className="relative group">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 animate-fade-in">
                  <div className="font-bold text-slate-800">
                    {user ? `${user.nombres} ${user.apellidos}` : "Estudiante"}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">{user ? user.rol : "ESTUDIANTE"}</div>
                  {user?.codigo_alumno && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-3 py-1">
                        <Code className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">{user.codigo_alumno}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full px-3 py-1">
                        <BookOpen className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Sem. {user.semestre_actual}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu - Con flex-1 para ocupar el espacio disponible */}
          <nav className="p-4 flex-1">
            <ul className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <li key={item.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <Link
                      to={item.path}
                      onClick={() => setActiveMenu(item.id)}
                      className={`group relative w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-4"} px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeMenu === item.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg scale-105"
                          : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 hover:text-slate-800 hover:scale-105"
                      }`}
                    >
                      {/* Indicador activo */}
                      {activeMenu === item.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"></div>
                      )}
                      <div
                        className={`p-2 rounded-lg ${activeMenu === item.id ? `bg-gradient-to-r ${item.gradient}` : "bg-slate-100 group-hover:bg-slate-200"} transition-all duration-300 group-hover:scale-110`}
                      >
                        <Icon
                          className={`w-5 h-5 ${activeMenu === item.id ? "text-white" : "text-slate-600 group-hover:text-slate-800"}`}
                        />
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {/* 🔔 Mostrar badge de notificaciones en "Mis Solicitudes" */}
                          {item.id === "solicitudes" && unreadCount > 0 && (
                            <div className="relative">
                              <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs rounded-full px-2.5 py-1 min-w-[1.5rem] h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 rounded-full animate-ping opacity-75"></div>
                            </div>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.id === "solicitudes" && unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Collapse Button */}
          <div className="p-4 border-t border-gray-100/50">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-3 text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 rounded-xl transition-all duration-300 group"
            >
              <Menu className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
              {!sidebarCollapsed && <span className="ml-3 font-medium">Contraer menú</span>}
            </button>
          </div>

          {/* Logout Button - Siempre en la parte inferior */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`group w-full flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-3"} px-4 py-3 text-sm font-semibold text-rose-600 hover:text-rose-800 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 rounded-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="p-2 bg-rose-100 group-hover:bg-rose-200 rounded-lg transition-all duration-300 group-hover:scale-110">
                <LogOut className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Header Mejorado */}
        <header className="px-8 py-6 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-lg relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {activeMenu === "inicio"
                    ? "Panel de Control"
                    : activeMenu === "solicitudes"
                      ? "Mis Solicitudes"
                      : "CertiPro"}
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {activeMenu === "inicio"
                    ? "Resumen de tu actividad académica"
                    : activeMenu === "solicitudes"
                      ? "Gestiona tus constancias y certificados"
                      : "Portal de constancias académicas"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications Button */}
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className={`relative p-3 rounded-xl transition-all duration-300 group ${
                    showNotifications
                      ? "text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-110"
                      : "text-slate-400 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:scale-110"
                  }`}
                >
                  <Bell className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-600 rounded-full animate-ping opacity-75"></div>
                    </>
                  )}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>

                {/* 🔔 Panel de Notificaciones Mejorado */}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-3 bg-white/50 backdrop-blur-sm hover:bg-white/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-sm">
                      {user ? `${user.nombres} ${user.apellidos}` : "Estudiante"}
                    </div>
                    <div className="text-xs text-slate-500">{user ? user.rol : "ESTUDIANTE"}</div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 🔔 Panel de Notificaciones Mejorado - Movido fuera del contexto del header */}
      {showNotifications && (
        <div
          className="fixed top-20 right-8 w-96 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl max-h-[500px] overflow-hidden animate-fade-in"
          style={{ zIndex: 99999 }}
        >
          {/* Header del panel */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Notificaciones</h3>
                <p className="text-sm text-slate-500">Últimas actualizaciones</p>
              </div>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((notification, index) => (
                <div
                  key={`${notification.id || notification.solicitud_id}-${index}`}
                  className={`p-6 border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 transition-all duration-300 group ${
                    notification.read ? "opacity-60" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          notification.read
                            ? "bg-gradient-to-r from-slate-100 to-gray-100"
                            : getNotificationBgColor(notification.estado)
                        }`}
                      >
                        {notification.read ? (
                          <FileText className="w-5 h-5 text-slate-400" />
                        ) : (
                          getNotificationIcon(notification.estado)
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 mb-1">
                        {notification.estado?.toLowerCase() === "aprobado" ||
                        notification.estado?.toLowerCase() === "aprobada"
                          ? "¡Solicitud Aprobada! ✅"
                          : notification.estado?.toLowerCase() === "rechazado" ||
                              notification.estado?.toLowerCase() === "rechazada"
                            ? "Solicitud Rechazada ❌"
                            : "Actualización de Solicitud"}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.estado?.toLowerCase() === "aprobado" ||
                        notification.estado?.toLowerCase() === "aprobada"
                          ? `Su solicitud #${notification.solicitud_id || notification.id} ha sido aprobada y está lista para descargar`
                          : notification.estado?.toLowerCase() === "rechazado" ||
                              notification.estado?.toLowerCase() === "rechazada"
                            ? `Su solicitud #${notification.solicitud_id || notification.id} fue rechazada. Revise los detalles`
                            : `Solicitud #${notification.solicitud_id || notification.id} - ${notification.estado}`}
                      </p>
                      {notification.motivo_rechazo && (
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-2">
                          <p className="text-sm text-rose-700 font-medium">Motivo: {notification.motivo_rechazo}</p>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(
                          notification.fecha_actualizacion ||
                            notification.fecha_solicitud ||
                            notification.fecha_creacion,
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0 animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-600 mb-2">No hay notificaciones</p>
                <p className="text-sm text-slate-400">
                  Te notificaremos cuando haya actualizaciones en tus solicitudes
                </p>
              </div>
            )}
          </div>

          {/* Footer del panel */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-slate-50 to-gray-50">
              <Link
                to="/estudiante/solicitudes"
                onClick={() => {
                  setShowNotifications(false)
                  setActiveMenu("solicitudes")
                }}
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
              >
                Ver todas mis solicitudes
              </Link>
            </div>
          )}
        </div>
      )}

      {showUserMenu && (
        <div
          className="fixed w-64 bg-white/95 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
          style={{
            top: "80px",
            right: "32px",
            zIndex: 99999,
          }}
        >
          <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-800">
                  {user ? `${user.nombres} ${user.apellidos}` : "Estudiante"}
                </div>
                <div className="text-sm text-slate-500">{user ? user.rol : "ESTUDIANTE"}</div>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 rounded-lg transition-all duration-300 group">
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Configuración</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 hover:text-rose-800 hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 rounded-lg transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar menús - Solo para notificaciones */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-[9998] bg-black/10"
          onClick={() => {
            setShowNotifications(false)
            setShowUserMenu(false)
          }}
        />
      )}

      {/* Overlay sutil solo para menú de usuario */}
      {showUserMenu && !showNotifications && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setShowUserMenu(false)} />
      )}

      <style jsx>{`
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default LayoutEstudiante
