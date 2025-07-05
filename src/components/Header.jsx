  import { useState, useRef, useEffect } from 'react'
  import { Search, Bell, ChevronDown } from 'lucide-react'
  import logo from '@/assets/images/logo_chat.png'
  import avatar from '@/assets/avatars/124_4x6.jpg' 

  const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen)
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

    return (
      <header className="fixed top-0 left-0 w-full z-10 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white py-4 px-8 shadow-2xl backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl shadow-lg">
              <img src={logo} alt="GoTalk Logo" className="h-8 w-8 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              GoTalk
            </h1>
          </div>

          {/* Search bar and notifications */}
          <div className="flex items-center space-x-4 relative">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
              <Bell className="h-5 w-5" />
            </button>

            {/* Avatar and dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:bg-white/10 p-2 rounded-xl transition duration-300"
              >
                <img src={avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
                <span className="font-semibold">Hữu Phát</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg z-50">
                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Trang cá nhân</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Cài đặt</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Đăng xuất</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    )
  }

  export default Header
