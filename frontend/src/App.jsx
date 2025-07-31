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
import Profile from '@/pages/Profile'
import ChangePassword from '@/pages/ChangePassword'

import { ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login"  element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<Register />} />    
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile/:slug" element={<Profile />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  )
}

export default App
