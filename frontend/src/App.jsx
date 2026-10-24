import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ShowroomPage from './pages/ShowroomPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/" element={<ProtectedRoute><ShowroomPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
