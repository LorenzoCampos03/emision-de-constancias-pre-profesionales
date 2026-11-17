import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import LayoutEstudiante from "./components/estudiante/LayoutEstudiante"
import ConstanciaList from "./components/ConstanciaList"
import "./index.css"
import ListaEstudiantes from "./components/ListaEstudiantes"
import GestionSolicitudes from "./components/GestionSolicitudes"
import Login from "./components/Login"
import Home from "./components/Home"
import HomeAlumno from "./components/estudiante/HomeAlumno"
import Solicitudes from "./components/estudiante/Solicitudes"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas para SECRETARIA */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="inicio" element={<Home />} />
          <Route path="constancias" element={<ConstanciaList />} />
          <Route path="estudiantes" element={<ListaEstudiantes />} />
          <Route path="solicitud" element={<GestionSolicitudes />} />
        </Route>

        {/* Rutas para ESTUDIANTE con Layout */}
        <Route
          path="/estudiante"
          element={
            <ProtectedRoute>
              <LayoutEstudiante />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeAlumno />} />
          <Route path="solicitudes" element={<Solicitudes />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
