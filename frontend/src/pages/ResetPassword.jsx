import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import bgImage from '@/assets/images/bg_gradient.jpg' 
import logo from '@/assets/images/logo_chat.png'
import { useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  })
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('email')
    if (!savedEmail) {
      navigate('/forgot-password')
    }
  }, [navigate])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setLoading(true)

    try {
        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password, confirmPassword }),
          credentials: 'include',
        })
        
        const data = await response.json()
        if(!response.ok) {
          setLoading(false)
          setServerError(data.message || 'Reset password failed. Please try again.')
          return
        }

        sessionStorage.removeItem('email')

        setTimeout(() => {
          setLoading(false)
          navigate('/login')
        }, 500)

    } catch (error) {
      setLoading(false)
      console.error('Registration error:', error)
      setServerError('An error occurred during reset password. Please try again later.')
    }
  }

  useEffect(() => {
    setServerError('')
    if (password === '') {
      setError((prev) => ({ ...prev, password: 'Password is required' }))
    } else if (password.length < 6) {
      setError((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }))
    } else {
      setError((prev) => ({ ...prev, password: '' })) 
    }
  }, [password])

  useEffect(() => {
    setServerError('')
    if (confirmPassword === '') {
      setError((prev) => ({ ...prev, confirmPassword: 'Confirm Password is required' }))
    } else if (confirmPassword !== password) {
      setError((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else {
      setError((prev) => ({ ...prev, confirmPassword: '' }))
    }
  }, [confirmPassword, password])

  return (
    <div className="min-h-screen h-full w-full flex flex-col bg-cover bg-center items-center justify-center p-0 m-0 overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-lg px-4">

        {/* Logo and title */}
        <div className="flex justify-center items-center space-x-3 mt-5 mb-6">
          <div className="p-2 rounded-2xl shadow-lg bg-white/90">
            <img src={logo} alt="GoTalk Logo" className="h-8 w-8 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-white text-shadow-lg">
            GoTalk
          </h1>
        </div>

        {/* Register form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-10">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold">Set new password</h2>
            <p className="text-gray-600 text-sm mt-1">Must be at least 6 characters</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setTouched((prev) => ({ ...prev, password: true }))
                  }}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <div
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {touched.password && error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setTouched((prev) => ({ ...prev, confirmPassword: true }))
                  }}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <div
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {touched.confirmPassword && error.confirmPassword && <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>}
            </div>

            {/* Reset password button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Reset password
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {/* Server error message */}
            {serverError && (
              <div className="text-red-500 text-sm text-center mt-2">
                {serverError}
              </div>
            )}

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600">
              <span
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
              >
                Back to Login
              </span>
            </p>

            {/* Loading spinner */}
            {loading && (
              <div className="flex justify-center items-center mt-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
