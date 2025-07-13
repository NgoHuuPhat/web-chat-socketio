import  { useEffect, useState }  from 'react'
import { Plus, Search, Users } from 'lucide-react'

const Sidebar = ({ users, selectedUser, onSelectUser }) => {
  const [searchItem, setSearchItem] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState(users)

  const [searchItemModal, setSearchItemModal] = useState('')
  const [modalUsers, setModalUsers] = useState(users)
  
  useEffect(() => {
    const delay = setTimeout(() => {
        const fetchSearchResults = async () => {
            try {
                const query = searchItem.trim()
                
                if (!query) {
                    setFilteredUsers(users)
                    return
                }

                const res = await fetch(`http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                },
                    credentials: 'include', 
                })

                const data = await res.json()
                if (res.ok) {
                    setFilteredUsers(data)
                } else {
                    console.error('Failed to fetch users:', data.message)
                }
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }

        fetchSearchResults()
    }, 300)

    // Cancel previous timeout on searchItem change or component unmount
    return () => clearTimeout(delay)
  }, [users, searchItem])

  useEffect(() => {
    const delay = setTimeout(() => {
        const fetchSearchResults = async () => {
            try {
                const query = searchItemModal.trim()
                
                if (!query) {
                    setModalUsers(users)
                    return
                }

                const res = await fetch(`http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                },
                    credentials: 'include', 
                })

                const data = await res.json()
                if (res.ok) {
                    setModalUsers(data)
                } else {
                    console.error('Failed to fetch users:', data.message)
                }
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }

        fetchSearchResults()
    }, 300)

    // Cancel previous timeout on searchItem change or component unmount
    return () => clearTimeout(delay)
  }, [users, searchItemModal])

  return (
    <>
        <aside className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/50 h-full flex flex-col shadow-xl backdrop-blur-sm">
            <div className="p-6 border-b border-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 flex items-center text-lg">
                    <Users className="h-5 w-5 mr-3 text-purple-600" />
                    Conversations
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                    {users.length}
                    </span>
                    <button 
                        className="p-2 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:scale-105"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus className="h-4 w-4 text-purple-600" />
                    </button>
                </div>
                </div>
                <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent focus:bg-white transition-all duration-200"
                    value={searchItem}   
                    onChange={(e) => setSearchItem(e.target.value)}              
                />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <ul className="p-4 space-y-2">
                {filteredUsers.map((user, index) => (
                    <li
                    key={index}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        selectedUser?.fullName === user.fullName
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'hover:bg-slate-100/80 hover:shadow-md'
                    }`}
                    onClick={() => onSelectUser(user)}
                    >
                    <div className='flex items-center space-x-3'>
                        <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${
                            selectedUser?.fullName === user.fullName ? 'bg-white/20' : user.color
                        }`}>
                            {user.fullName[0]}
                        </div>
                        {user.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${selectedUser?.fullName === user.fullName ? 'text-white' : 'text-slate-900'}`}>
                            {user.fullName}
                        </p>
                        <p className={`text-sm truncate ${selectedUser?.fullName === user.fullName ? 'text-white/80' : 'text-slate-500'}`}>
                            {user.lastMessage}
                        </p>
                        </div>
                        {user.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-bounce">
                            {user.unread}
                        </span>
                        )}
                    </div>
                    </li>
                ))}
                </ul>
            </div>
        </aside>

         {/* Model add user */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[105vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-slate-900 px-6 py-4">
                    <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Add Friends</h3>
                    <button
                        onClick={() => {
                        setShowModal(false)
                        setSearchItemModal('')
                        }}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                </div>

                {/* Search Section */}
                <div className="px-6 pt-6 pb-4">
                    <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                        value={searchItemModal}
                        onChange={(e) => setSearchItemModal(e.target.value)}
                    />
                    </div>
                </div>

                {/* Users List */}
                <div className="px-6 pb-6 max-h-96 overflow-y-auto">
                    {modalUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        </div>
                        <p className="text-sm">No users found</p>
                    </div>
                    ) : (
                    <ul className="space-y-3">
                        {modalUsers.map(user => (
                        <li
                            key={user._id}
                            className="group p-4 bg-slate-50 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-200"
                            onClick={() => {
                            onSelectUser({
                                ...user,
                                lastMessage: 'New user added',
                                unread: 0,
                                online: true,
                                color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            })
                            setShowModal(false)
                            setSearchItemModal('')
                            }}
                        >
                            <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-105 transition-transform duration-200 ${
                                user.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}>
                                {user.fullName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1">
                                <span className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200">
                                {user.fullName}
                                </span>
                                <p className="text-sm text-slate-500 mt-1">Click to add friend</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                        {modalUsers.length} user{modalUsers.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-medium text-slate-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                        onClick={() => {
                        setShowModal(false)
                        setSearchItemModal('')
                        }}
                    >
                        Cancel
                    </button>
                    </div>
                </div>
                </div>
            </div>
        )}
    </>
  )
}

export default Sidebar