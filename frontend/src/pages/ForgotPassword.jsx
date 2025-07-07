import { useState } from 'react'
import bgImage from '@/assets/images/bg_gradient.jpg' 
import logo from '@/assets/images/logo_chat.png'
import { useNavigate } from 'react-router-dom'
import validator from 'validator'
import { useEffect } from 'react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')

    try {
        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.message || 'Forgot password failed. Please try again.')
        setLoading(false)
        return
      }

      sessionStorage.setItem('email', email)

      setTimeout(() => {
        setLoading(false)
        navigate('/verify-otp')
      },500)

    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      setServerError('An error occurred while forgot password. Please try again later.')
    } 
  }

  useEffect(() => {
    setServerError('')
    if (email === '') {
      setError((prev) => ({ ...prev, email: 'Email is required' }))
    } else if (!validator.isEmail(email)) {
      setError((prev) => ({ ...prev, email: 'Invalid email format' }))
    } else {
      setError((prev) => ({ ...prev, email: '' }))
    }
  }, [email])

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

        {/* Login form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-10">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold">Forgot Password?</h2>
            <p className="mt-3 mb-5">No worries, we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setTouched((prev) => ({ ...prev, email: true }))
                }}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              {touched.email && error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>


            {/* ✅ Reset Password button changed to real form submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg cursor-pointer font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Reset Password
            </button>
          </form>
          <div className="mt-4 space-y-4">
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

export default ForgotPassword