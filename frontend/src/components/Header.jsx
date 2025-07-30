  import { useState, useRef, useEffect } from 'react'
  import { Search, Bell, ChevronDown } from 'lucide-react'
  import logo from '@/assets/images/logo_chat.png'
  import avatar from '@/assets/avatars/124_4x6.jpg'
  import { useNavigate, Link } from 'react-router-dom'  
  import { useAuth } from '@/context/AuthContext'

  const Header = () => {
    const { setUser, user, loading } = useAuth()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen)
    }
    
    const handleLogout = async () => {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'GET',
          credentials: 'include', 
        })

        setUser(null) 
        sessionStorage.removeItem('email')
        navigate('/login')

      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    },[])

    if (loading) return null

    return (
      <header className="fixed top-0 left-0 w-full z-10 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white py-4 px-8 shadow-2xl backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl shadow-lg">
              <img src={logo} alt="GoTalk Logo" className="h-8 w-8 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              GoTalk
            </h1>
          </Link>

          {/* Search bar and notifications */}
          <div className="flex items-center space-x-4 relative">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
              <Bell className="h-5 w-5" />
            </button>

            {/* Avatar and dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:bg-white/10 p-2 rounded-xl cursor:pointer transition duration-300 cursor-pointer"
                >
                  <img src={avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
                  <span className="font-semibold">{user.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg z-50">
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <Link to={`/profile/${user.slug}`} className="flex items-center space-x-2">
                          <span>Profile</span>
                        </Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Change Password</li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                      <li onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Log out</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white font-semibold rounded-full shadow-md hover:text-white/80 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-white font-semibold bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 rounded-full shadow-md transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  export default Header
