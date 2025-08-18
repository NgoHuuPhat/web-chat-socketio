import { useEffect, useState, useRef } from 'react'
import { MapPin, User, Calendar, Edit2, Phone, Mail, LoaderCircle, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'
import validator from 'validator'
import { useParams } from 'react-router-dom'
import { formatTime } from '@/utils/formatTime'
import Avatar from '@/components/Avatar'
import ActionButton from '@/components/ActionButton'
import FormField from '@/components/FormField'
import Header from '@/components/Header'
import { useAuth } from '@/context/AuthContext'

const Profile = () => {
  const { slug } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [userInfo, setUserInfo] = useState({})
  const imageInputRef = useRef(null)
  const { setUser } = useAuth()

  useEffect(() => {
    try {
      const fetchUserProfile = async () => {
        const res = await fetch(`http://localhost:3000/api/users/${slug}`,{
          method: 'GET',
          credentials: 'include', 
        })
        const data = await res.json()
        if (!res.ok){
          console.error('Failed to fetch user profile:', data.message)
        }
        setUserInfo(data)
      }
      fetchUserProfile()
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [slug])

  const handleInputChange = (field, value) => {
    setError(null)
    setUserInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)
    try {
      setUploading(true)
      
      const res = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('Failed to upload file:', data.message)
      }

      setUserInfo(prev => ({ ...prev, avatar: data.user.avatar }))
      setUser(prev => ({ ...prev, avatar: data.user.avatar }))
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
      e.target.value = null
    }
  }

  const handleSaveChanges = async () => {
    if(!validator.isMobilePhone(userInfo.phone, 'vi-VN')){
      setError('Invalid phone number format')
      return
    }

    try {
      const res = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('Failed to save changes:', data.message)  
        return toast.error(data.message || 'Failed to save changes')
      }

      setUserInfo(data.user)
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleToggleEdit = () => {
    if(isEditing) {
      handleSaveChanges()
    } else {
      setIsEditing(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">

      {/* Header */}
      <Header/>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative mt-15">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Profile
          </h1>
        </div>

        {/* User Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 mb-8 shadow-2xl shadow-purple-200/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0 relative">
              <Avatar 
                userInfo={userInfo} 
                onAvatarClick={() => imageInputRef.current.click()}
                size="large"
                className={uploading ? "opacity-30" : "border-4 shadow-2xl shadow-purple-300/40"}
              />

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                  <LoaderCircle className="h-6 w-6 text-gray-700 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent py-2 drop-shadow-md">
                {userInfo.fullName}
              </h2>
              <p className="text-cyan-600 text-xl mb-4 font-semibold">@{userInfo.slug}</p>

              <div className="flex flex-col sm:flex-row items-center gap-6 text-slate-700 mb-6">
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 shadow-lg shadow-blue-200/30">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-800 font-medium">{userInfo.location}</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-200/50 shadow-lg shadow-purple-200/30">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-slate-800 font-medium">Birth date: {formatTime(userInfo.birthDate)}</span>
                </div>
              </div>

              {userInfo.bio && (
                <div className="break-words break-all bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 backdrop-blur-sm border border-indigo-200/50 shadow-lg shadow-indigo-200/20">
                  <p className="text-slate-700 leading-relaxed font-medium">{userInfo.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden shadow-2xl shadow-purple-200/20">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">Personal Information</h2>
              </div>
              <div className="flex gap-3">
                {isEditing && (
                  <ActionButton
                    icon={X}
                    label="Cancel"
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                  />
                )}
                <ActionButton
                  icon={isEditing ? Save : Edit2}
                  label={isEditing ? 'Save Changes' : 'Edit'}
                  onClick={handleToggleEdit}
                  variant={isEditing ? 'success' : 'primary'}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-2xl p-8 border border-blue-200/40 backdrop-blur-sm shadow-inner">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField
                    label="Display Name"
                    value={userInfo.fullName}
                    onChange={value => handleInputChange('fullName', value)}
                    isEditing={isEditing}
                    icon={User}
                  />
                  <FormField
                    label="Email"
                    value={userInfo.email}
                    type="email"
                    icon={Mail}
                    isEditing={isEditing}
                    disabled={true}
                  />
                  <FormField
                    label="Phone Number"
                    value={userInfo.phone}
                    onChange={value => handleInputChange('phone', value)}
                    isEditing={isEditing}
                    type="tel"
                    icon={Phone}
                    error={error}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    label="Location"
                    value={userInfo.location}
                    onChange={value => handleInputChange('location', value)}
                    isEditing={isEditing}
                    icon={MapPin}
                  />
                  <FormField
                    label="Join Date"
                    type="date"
                    value={formatTime(userInfo.joinDate)}
                    onChange={value => handleInputChange('joinDate', value)}
                    isEditing={isEditing}
                    icon={Calendar}
                    disabled={true}
                  />
                  <FormField
                    label="Birthday"
                    type="date"
                    value={formatTime(userInfo.birthDate)}
                    onChange={value => handleInputChange('birthDate', value)}
                    isEditing={isEditing}
                    icon={Calendar}
                  />
                </div>
              </div>

              {/* Bio Section */}
              {isEditing && (
                <div className="mt-8 pt-8 border-t border-indigo-200/50">
                  <div className="space-y-3">
                    <label className="text-slate-700 font-semibold text-sm uppercase tracking-wider">About Me</label>
                    <textarea
                      value={userInfo.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full bg-white/60 border border-indigo-200/50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm resize-none font-medium"
                      placeholder="Write a few lines about yourself..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default Profile