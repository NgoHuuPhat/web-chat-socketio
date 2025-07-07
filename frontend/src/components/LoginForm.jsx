import React, { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import bgImage from '@/assets/images/bg_gradient.jpg' 
import logo from '@/assets/images/logo_chat.png'
import { useNavigate } from 'react-router-dom'
import validator from 'validator'
import { useEffect } from 'react'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState({
    email: '',
    password: '',
  })
  const [serverError, setServerError] = useState('')
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [loading, setLoading] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
        credentials: 'include', 
      })

      const data = await response.json()
      if (!response.ok) {
        setServerError(data.message || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      setTimeout(() => {
        setLoading(false)
        if(data.auth.roleName === 'user') {
          navigate('/')
        } else {
          navigate('/admin')
        }
      },500)

    } catch (error) {
      setLoading(false)
      console.error('Login error:', error)
      setServerError('An error occurred while logging in. Please try again later.')
    } 
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/check-auth', {
          method: 'GET',
          credentials: 'include', 
        })
        if (!response.ok) {
          throw new Error('Not authenticated')
        }
        const data = await response.json()
        if(data.roleName == 'user') {
          navigate('/')
        } else {
          navigate('/admin')
        }
      }
      catch (error) {
        console.error('Authentication check failed:', error)
        navigate('/login')
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (email === '') {
      setError((prev) => ({ ...prev, email: 'Email is required' }))
    } else if (!validator.isEmail(email)) {
      setError((prev) => ({ ...prev, email: 'Invalid email format' }))
    } else {
      setError((prev) => ({ ...prev, email: '' }))
    }
  }, [email])

  useEffect(() => {
    if (password === '') {
      setError((prev) => ({ ...prev, password: 'Password is required' }))
    } else {
      setError((prev) => ({ ...prev, password: '' }))
    }
  }, [password])

  return (
    <div className="min-h-screen h-full w-full flex flex-col bg-cover bg-center items-center justify-center p-0 m-0 overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md px-4">
        {/* Back button */}
        <div className="absolute -top-16 left-0 text-white/80 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
          <ArrowLeft size={20} />
          <span className="text-sm">Home page</span>
        </div>

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
            <h2 className="text-2xl font-bold">LOGIN</h2>
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
                  placeholder="Enter your password"
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

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <div
                onClick= {() => navigate('/forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </div>
            </div>

            {/* ✅ Sign in button changed to real form submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r  from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg cursor-pointer font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Sign in
            </button>
          </form>
          <div className="mt-4 space-y-4">
            {/* Server error message */}
            {serverError && (
              <div className="text-red-500 text-sm text-center mt-2">
                {serverError}
              </div>
            )}

            {/* Google sign in */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div
              onClick={() => console.log('Google sign in clicked')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>
              Sign in with Google
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
              >
                Sign up
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

export default LoginForm