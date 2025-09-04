// src/routes.jsx
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home.jsx'
import { Admin } from './pages/Admin.jsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
