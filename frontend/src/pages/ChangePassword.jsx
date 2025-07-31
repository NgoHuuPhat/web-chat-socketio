import { useState } from 'react'
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import FormField from '@/components/FormField'
import Header from '@/components/Header'
import ActionButton from '@/components/ActionButton'
import { useNavigate } from 'react-router-dom'

const PasswordStrength = ({ password }) => {
  const getStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 6) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Average', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-blue-500' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' }
    ]

    return levels[score]
  }

  const strength = getStrength(password)
  
  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-600">Độ mạnh mật khẩu</span>
        <span className="text-sm font-medium text-slate-700">{strength.label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-slate-200'
            } transition-colors duration-300`}
          />
        ))}
      </div>
    </div>
  )
}

const ChangePassword = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Please enter current password' })
      return false
    }

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter new password' })
      return false
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Confirm password does not match' })
      return false
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('http://localhost:3000/api/users/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('Error changing password:', data.message)
        setMessage({ type: 'error', text: data.message || 'An error occurred. Please try again!' })
        return
      }
      
      setMessage({ type: 'success', text: data.message || 'Password has been changed successfully!' })
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại!' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (message.text) setMessage({ type: '', text: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <Header />

        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
        </div>

        {/* Title */}
        <div className="text-center mb-12 pt-8 mt-20 lg:mt-10">
          <h1 className="leading-snug text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
            Change Password
          </h1>
          <p className="text-slate-600 font-bold text-lg">Update your password to secure your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Current Password */}
            <FormField
              label="Current Password"
              type="password"
              icon={Lock}
              value={formData.currentPassword}
              onChange={(value) => updateField('currentPassword', value)}
              showPassword={showPasswords.current}
              onTogglePassword={() => togglePasswordVisibility('current')}
            />

            {/* New Password */}
            <FormField
              label="New Password"
              type="password"
              icon={Lock}
              value={formData.newPassword}
              onChange={(value) => updateField('newPassword', value)}
              showPassword={showPasswords.new}
              onTogglePassword={() => togglePasswordVisibility('new')}
            />

            {/* Password Strength */}
            {formData.newPassword && (
              <PasswordStrength password={formData.newPassword} />
            )}

            {/* Confirm Password */}
            <FormField
              label="Confirm New Password"
              type="password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              showPassword={showPasswords.confirm}
              onTogglePassword={() => togglePasswordVisibility('confirm')}
            />

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center gap-2">
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex pt-4 justify-between">
              <ActionButton
                icon={ArrowLeft}
                label="Home Page"
                onClick={() => navigate('/')}
                variant="secondary"
                className="px-14"
                isLoading={isLoading}
              />

              <ActionButton
                icon={Lock}
                label="Change Password"
                onClick={handleSubmit}
                variant="primary"
                isLoading={isLoading}
                className="px-7"
              />
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡Security Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use at least 8 characters</li>
              <li>• Combine lowercase, uppercase, numbers, and special characters</li>
              <li>• Do not use easily guessable personal information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
