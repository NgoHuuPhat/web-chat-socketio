import  { useState }  from 'react'
import { Plus, Search, Users } from 'lucide-react'

const Sidebar = ({ users, selectedUser, onSelectUser }) => {
  const [searchItem, setSearchItem] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchItem.toLowerCase())
  )

  const handleAddUser = () => {
    if(newUserName.trim()) {
        const newUser = {
            name: newUserName,
            lastMessage: 'New user added',
            online: true,
            unread: 0,
            color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
        }
        onSelectUser(newUser)
        setNewUserName('')
        setShowModal(false)
    }
  }

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
                        selectedUser?.name === user.name
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'hover:bg-slate-100/80 hover:shadow-md'
                    }`}
                    onClick={() => onSelectUser(user)}
                    >
                    <div className='flex items-center space-x-3'>
                        <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${
                            selectedUser?.name === user.name ? 'bg-white/20' : user.color
                        }`}>
                            {user.name[0]}
                        </div>
                        {user.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${selectedUser?.name === user.name ? 'text-white' : 'text-slate-900'}`}>
                            {user.name}
                        </p>
                        <p className={`text-sm truncate ${selectedUser?.name === user.name ? 'text-white/80' : 'text-slate-500'}`}>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-96 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Add friends</h3>
                    <input 
                        type="text"
                        placeholder="Enter user name..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            onClick={handleAddUser}
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  )
}

export default Sidebar