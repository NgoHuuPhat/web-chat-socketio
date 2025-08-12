import { useState } from 'react'
import { Users, Bell, Search, LogOut, Trash, Crown, Shield, User, MoreVertical, UserPlus, Settings, ChevronDown } from 'lucide-react'
import { getTimeAgo } from '@/utils/formatTime'

const MembersSidebar = ({
    selectedConversation,
    users,
    currentUserId,
}) => {
    const [showMembers, setShowMembers] = useState(false)

    const getOnlineStatus = (member) => {
        const userDetails = users.find(u => u._id === member._id) || {}

        const isOnline = userDetails.isOnline 
        const lastOnline = userDetails.lastOnline 

        if (isOnline) return 'Online'
        if (lastOnline) return `Online ${getTimeAgo(lastOnline)}`
    }

    // Trường hợp 1-1 conversation
    if (!selectedConversation.isGroup) {
        const otherUserId = selectedConversation.members.find(m => m._id !== currentUserId)?._id
        // Tìm user trong users trước, fallback sang member trong conversation
        const userDetails = users.find(u => u._id === otherUserId) || selectedConversation.members.find(m => m._id === otherUserId) || {}

        return (
            <aside className="w-sm bg-white border-l border-gray-200 flex flex-col h-full py-6 px-2">
                {/* Profile */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-md">
                        {(userDetails.fullName?.[0] || userDetails.username?.[0] || '?').toUpperCase()}
                    </div>
                    <h2 className="mt-4 mb-1 text-xl font-semibold text-gray-900">{userDetails.fullName || userDetails.username || 'Unknown'}</h2>
                    <p className="text-sm text-gray-500">{getOnlineStatus(userDetails)}</p>
                </div>

                <nav className="flex justify-center gap-2 space-x-4 mt-2 mb-2 text-gray-600">
                    <button
                        type="button"
                        className="flex flex-col cursor-pointer items-center text-xs hover:text-pink-500 transition"
                        aria-label="Profile"
                    >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                            <User className="w-4 h-4" />
                        </div>
                        Profile
                    </button>

                    <button
                        type="button"
                        className="flex flex-col cursor-pointer items-center text-xs hover:text-pink-500 transition"
                        aria-label="Notifications"
                    >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                            <Bell className="w-4 h-4" />
                        </div>
                        Notifications
                    </button>

                    <button
                        type="button"
                        className="flex flex-col cursor-pointer items-center text-xs hover:text-pink-500 transition"
                        aria-label="Search"
                    >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                            <Search className="w-4 h-4" />
                        </div>
                        Search
                    </button>
                </nav>

                <hr className="my-4 border-gray-300" />

                <div className="flex flex-col space-y-3 text-gray-700 text-sm">
                    <button
                        type="button"
                        className="flex justify-between cursor-pointer items-center px-4 py-2 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <span>Photo/Videos</span>
                        <span className="text-gray-600">
                            <ChevronDown className="w-4 h-4 font-semibold" />
                        </span>
                    </button>

                    <button
                        type="button"
                        className="flex justify-between cursor-pointer items-center px-4 py-2 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <span>Files</span>
                        <span className="text-gray-600">
                            <ChevronDown className="w-4 h-4 font-semibold" />
                        </span>
                    </button>

                    <button
                        type="button"
                        className="flex justify-between cursor-pointer items-center px-4 py-2 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                        <span>Privacy & Support</span>
                        <span className="text-gray-600">
                            <ChevronDown className="w-4 h-4 font-semibold" />
                        </span>
                    </button>
                </div>

                <hr className="my-4 border-gray-300" />

                <footer className="p-5 pt-2">
                    <button
                        type="button"
                        className="w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition"
                    >
                        <Trash className="w-5 h-5" />
                        <span>Clear chat history</span>
                    </button>
                </footer>
            </aside>
        )
    }

    // Group conversation
    const members = selectedConversation.members || []
    const membersWithDetails = members.map(member => {
        const userDetails = users.find(u => u._id === member._id) || member
        return {
            ...member,
            ...userDetails,
            isOnline: userDetails.isOnline || false,
            lastOnline: userDetails.lastOnline,
        }
    })

    const currentUser = members.find(m => m._id === currentUserId)
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner'
    const isOwner = currentUser?.role === 'owner'

    const getRoleIcon = (role) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
            case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
            default: return <User className="w-4 h-4 text-gray-400" />
        }
    }

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner': return 'Owner'
            case 'admin': return 'Admin'
            default: return 'Member'
        }
    }

    const canManageMember = (targetMember) => {
        if (!isAdmin) return false
        if (targetMember._id === currentUserId) return false
        if (targetMember.role === 'owner') return false
        if (targetMember.role === 'admin' && !isOwner) return false
        return true
    }

    const renderGroupAvatar = () => {
        const avatars = membersWithDetails.slice(0, 3)
        if (avatars.length === 0) {
            return (
                <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                    G
                </div>
            )
        }

        return (
            <div className="flex -space-x-3">
                {avatars.map((member, idx) => (
                    <div
                        key={member._id}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white"
                        style={{ zIndex: avatars.length - idx }}
                        title={member.fullName || member.username}
                    >
                        {member.fullName?.[0]?.toUpperCase() || member.username?.[0]?.toUpperCase() || '?'}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <aside className="w-sm bg-white border-l border-gray-200 flex flex-col h-full">
            <header className="p-6 border-b border-gray-200 flex flex-col items-center">
                <div>
                    {renderGroupAvatar()}
                </div>
                <span className="font-semibold text-xl text-center mt-2">{selectedConversation.groupName}</span>
            </header>

             <nav className="flex flex-col flex-grow px-5 py-4 text-gray-700 text-sm border-b border-gray-100 min-h-0">
                <button
                    type="button"
                    className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition font-semibold px-4 py-2"
                    onClick={() => setShowMembers(!showMembers)}
                >
                    <span>Members</span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 font-semibold transition-transform ${showMembers ? 'rotate-180' : ''}`}
                    />
                </button>

                {showMembers && (
                    <section
                        id="members-list"
                        className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 min-h-0"
                    >
                        {membersWithDetails.map(member => (
                            <div
                                key={member._id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition"
                            >
                                <div className="flex items-center space-x-4 min-w-0">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                            {(member.fullName?.[0] || member.username?.[0] || '?').toUpperCase()}
                                        </div>
                                        <span
                                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="font-medium truncate">
                                                {member.fullName || member.username}
                                                {member._id === currentUserId && (
                                                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                                                )}
                                            </p>
                                            {getRoleIcon(member.role)}
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <p>{getRoleLabel(member.role)}</p>
                                        </div>
                                    </div>
                                </div>

                                {canManageMember(member) && (
                                    <button
                                        type="button"
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition"
                                        aria-label="Manage member"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                <button
                    type="button"
                    className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition font-semibold px-4 py-2"
                >
                    <span>Photo/Videos</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 font-semibold" />
                </button>

                <button
                    type="button"
                    className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition font-semibold px-4 py-2"
                >
                    <span>Files</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 font-semibold" />
                </button>

                <button
                    type="button"
                    className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition font-semibold px-4 py-2"
                >
                    <span>Privacy & Support</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 font-semibold" />
                </button>
            </nav>

            <footer className="p-5 border-t border-gray-200">
                <button
                    type="button"
                    className="w-full mb-4 cursor-pointer flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition"
                >
                    <Trash className="w-5 h-5" />
                    <span>Clear chat history</span>
                </button>
                <button
                    type="button"
                    className="w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition"
                    aria-label="Leave Group"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Leave Group</span>
                </button>
            </footer>
        </aside>
    )
}

export default MembersSidebar
