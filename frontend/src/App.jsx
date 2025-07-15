import '@/App.css'
import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Chat from '@/pages/Chat'
import ForgotPassword from '@/pages/ForgotPassword'
import VerifyOTP from '@/pages/VerifyOTP'
import ResetPassword from '@/pages/ResetPassword'
import ProtectedRoute from '@/components/ProtectedRoute'
import PublicOnlyRoute from '@/components/PublicOnlyRoute'

// Main App Component
const App = () => {
  return (
    <Routes>
      <Route path="/login"  element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<Register />} />    
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/messages/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
