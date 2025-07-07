import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './pages/Chat.jsx'

import ForgotPassword from './pages/ForgotPassword.jsx'
import VerifyOTP from './pages/VerifyOTP.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

// Main App Component
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />    
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Chat />} />
    </Routes>
  )
}

export default App
