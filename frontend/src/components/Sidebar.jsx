import { useEffect, useState } from 'react'
import { UserPlus, Search, Users, Plus } from 'lucide-react'
import { getTimeAgo } from '@/utils/formatTime'
import { useAuth } from '@/context/AuthContext'

const Sidebar = ({ users, selectedConversation, setConversations, conversations, currentUserId, onSelectConversation }) => {
  const { user } = useAuth()
  
  const [searchItem, setSearchItem] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [filteredConversations, setFilteredConversations] = useState(conversations)

  const [searchItemModal, setSearchItemModal] = useState('')
  const [modalUsers, setModalUsers] = useState(users)

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')

  // Handle filtering conversations when searchItem changes
  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchSearchResults = async () => {
        try {
          const query = searchItem.trim()
          if (!query) {
            setFilteredConversations(conversations)
            return
          }

          const res = await fetch(`http://localhost:3000/api/conversations/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
          const data = await res.json()
          if (res.ok) {
            setFilteredConversations(data)
          } else {
            console.error('Failed to fetch conversations:', data.message)
          }
        } catch (error) {
          console.error('Error fetching conversations:', error)
        }
      }

      fetchSearchResults()
    }, 100)

    return () => clearTimeout(delay)
  }, [conversations, searchItem])

  // Handle filtering users inside modal
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
    }, 100)

    return () => clearTimeout(delay)
  }, [users, searchItemModal])

  const handleCreateGroup = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:3000/api/conversations/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupName: groupName.trim(),
          members: selectedUsers.map(user => user._id),
          groupAvatar: '',
        }),
      })

      const data = await res.json()
      console.log('Create group response:', data)

      if (res.ok) {
        setConversations(prev => [data, ...prev])
        onSelectConversation(data)

        setShowCreateGroupModal(false)
        setSelectedUsers([])
        setGroupName('')
        setSearchItemModal('')
      } else {
        console.error('Failed to create group conversation:', data.message)
      }
    } catch (error) {
      console.error('Error creating group conversation:', error)
    }
  }

  return (
    <>
      <aside className="w-90 bg-gradient-to-b from-slate-50 to-white border-r border-slate-300/50 h-full flex flex-col backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="flex items-center text-lg font-bold text-slate-800">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Conversations
              </h2>
              <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-2 py-1 rounded-md font-medium">
                {conversations.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1 hover:bg-purple-100 cursor-pointer rounded-md transition-all duration-200 hover:scale-105"
                onClick={() => setShowUserModal(true)}
              >
                <UserPlus className="h-4 w-4 text-purple-600" />
              </button>
              <button
                className="flex p-1 items-center cursor-pointer hover:bg-purple-100 rounded-md transition-all duration-200 hover:scale-105"
                onClick={() => setShowCreateGroupModal(true)}
              >
                <Users className="h-4 w-4 text-purple-600" />
                <Plus className="h-2 w-2 text-purple-600" />
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
            {filteredConversations.map((conversation, index) => {
              const isSelected = selectedConversation?._id === conversation._id
              const isGroup = conversation.isGroup === true

              let displayName = 'Unknown'
              let avatarElement
              let isOnline = false

              if (isGroup) {
                displayName = conversation.groupName || 'Unnamed Group'

                // Group avatar logic
                if (conversation.groupAvatar) {
                  avatarElement = (
                    <img
                      src={conversation.groupAvatar}
                      alt={`${displayName}'s Avatar`}
                      className={isSelected ? 'h-12 w-12 rounded-full object-cover border-1 border-white' : 'h-12 w-12 rounded-full object-cover border-1 border-slate-300'}
                    />
                  )
                } else {
                  // No group avatar, show member avatars (including current user)
                  const allMembers = conversation.members || []
                  const totalMembers = allMembers.length

                  const membersData = allMembers.map(member => {
                    if (member._id === user._id) {
                      return user
                    }
                    return users.find(user => user._id === member._id) || member
                  })

                  if (totalMembers === 2) {
                    avatarElement = (
                      <div className="flex space-x-[-4px]">
                        {membersData.slice(0, 2).map((memberData, idx) => (
                          <div key={idx} className="relative">
                            {memberData?.avatar ? (
                              <img
                                src={memberData.avatar}
                                alt={`${memberData.fullName}'s Avatar`}
                                className={isSelected ? 'h-6 w-6 rounded-full object-cover border-1 border-white' : 'h-6 w-6 rounded-full object-cover border border-slate-300'}
                              />
                            ) : (
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-1 border-white ${
                                memberData?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}>
                                {memberData?.fullName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  } else if (totalMembers === 3) {
                    avatarElement = (
                      <div className="flex flex-col space-y-[-4px]">
                        {/* First row: 1 avatar centered */}
                        <div className="flex justify-center">
                          <div className="relative">
                            {membersData[0]?.avatar ? (
                              <img
                                src={membersData[0].avatar}
                                alt={`${membersData[0].fullName}'s Avatar`}
                                className={isSelected ? 'h-6 w-6 rounded-full object-cover border-1 border-white' : 'h-6 w-6 rounded-full object-cover border border-slate-300'}
                              />
                            ) : (
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-1 border-white ${
                                membersData[0]?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}>
                                {membersData[0]?.fullName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Second row: 2 avatars */}
                        <div className="flex space-x-[-4px] justify-center">
                          {membersData.slice(1, 3).map((memberData, idx) => (
                            <div key={idx + 1} className="relative">
                              {memberData?.avatar ? (
                                <img
                                  src={memberData.avatar}
                                  alt={`${memberData.fullName}'s Avatar`}
                                  className={isSelected ? 'h-6 w-6 rounded-full object-cover border-1 border-white' : 'h-6 w-6 rounded-full object-cover border border-slate-300'}
                                />
                              ) : (
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-1 border-white ${
                                  memberData?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}>
                                  {memberData?.fullName?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } else {
                    // 4+ members
                    const extraMembers = totalMembers - 3
                    avatarElement = (
                      <div className="flex flex-col space-y-[-4px]">
                        {/* First row: 2 avatars */}
                        <div className="flex space-x-[-4px]">
                          {membersData.slice(0, 2).map((memberData, idx) => (
                            <div key={idx} className="relative">
                              {memberData?.avatar ? (
                                <img
                                  src={memberData.avatar}
                                  alt={`${memberData.fullName}'s Avatar`}
                                  className={isSelected ? 'h-6 w-6 rounded-full object-cover border-1 border-white' : 'h-6 w-6 rounded-full object-cover border border-slate-300'}
                                />
                              ) : (
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-1 border-white ${
                                  memberData?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}>
                                  {memberData?.fullName?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Second row: 1 avatar + count */}
                        <div className="flex space-x-[-4px]">
                          <div className="relative">
                            {membersData[2]?.avatar ? (
                              <img
                                src={membersData[2].avatar}
                                alt={`${membersData[2].fullName}'s Avatar`}
                                className={isSelected ? 'h-6 w-6 rounded-full object-cover border-1 border-white' : 'h-6 w-6 rounded-full object-cover border border-slate-300'}
                              />
                            ) : (
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-xs border-1 border-white ${
                                membersData[2]?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}>
                                {membersData[2]?.fullName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xs border-1 border-white">
                            +{extraMembers > 99 ? '99' : extraMembers}
                          </div>
                        </div>
                      </div>
                    )
                  }
                }
              } else {
                // One-on-one conversation
                const partnerId = conversation.members.find(member => member._id !== currentUserId)?._id
                const partner = users.find(user => user._id === partnerId)
                if (partner) {
                  displayName = partner.fullName
                  avatarElement = partner.avatar ? (
                    <img
                      src={partner.avatar}
                      alt={`${partner.fullName}'s Avatar`}
                      className={isSelected ? 'h-12 w-12 rounded-full object-cover border-1 border-white' : 'h-12 w-12 rounded-full object-cover border-1 border-slate-300'}
                    />
                  ) : (
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      partner.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}>
                      {partner.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )
                  isOnline = partner.isOnline
                } else {
                  avatarElement = (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      ?
                    </div>
                  )
                }
              }

              // Dynamic classes for styling
              let containerClass = 'p-4 rounded-2xl cursor-pointer min-h-20 transition-all duration-300 hover:scale-[1.02] '
              if (isSelected) {
                containerClass += 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
              } else {
                containerClass += 'hover:bg-slate-100/80 hover:shadow-md'
              }

              let avatarClass = 'flex items-center justify-center '

              let nameClass = 'font-semibold truncate '
              nameClass += isSelected ? 'text-white' : 'text-slate-900'

              let messageClass = 'text-sm truncate '
              conversation.unreadCount?.[currentUserId] > 0 ? messageClass += 'font-bold ' : messageClass += 'font-normal '
              messageClass += isSelected ? 'text-white/80' : 'text-slate-800'

              return (
                <li key={index} className={containerClass} onClick={() => onSelectConversation(conversation)}>
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className={avatarClass}>
                        {avatarElement}
                      </div>
                      {isOnline && !isGroup && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-1 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={nameClass}>{displayName}</p>
                      <p className={messageClass}>
                        {(() => {
                          const lastMessage = conversation.lastMessage
                          if (!lastMessage) return ''

                          const { content, senderId, attachments, deleted, createdAt } = lastMessage
                          const prefix = senderId === currentUserId ? 'You: ' : ''
                          const timeAgo = getTimeAgo(createdAt)

                          if (deleted) {
                            return `${prefix}Message has been recalled • ${timeAgo}`
                          }

                          if (attachments && attachments.length > 0) {
                            const type = attachments[0].type
                            const typeLabel =
                              type === 'image' ? 'Sent a picture' :
                              type === 'video' ? 'Sent a video' :
                              type === 'file' ? 'Sent a file' :
                              type === 'audio' ? 'Sent an audio' :
                              'Sent an attachment'

                            return `${prefix}${typeLabel} • ${timeAgo}`
                          }

                          if (content && content.length > 10) {
                            return `${prefix}${content.slice(0, 10)}... ${timeAgo}`
                          } else {
                            return `${prefix}${content} • ${timeAgo}`
                          }
                        })()}
                      </p>
                    </div>

                    {/* Badge messages unread */}
                    {conversation.unreadCount?.[currentUserId] > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-bounce">
                        {conversation.unreadCount[currentUserId] > 5 ? '5+' : conversation.unreadCount[currentUserId]}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* Modal add user */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[105vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Friends</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false)
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
                  className="w-full pl-12 pr-4 py-3 border-1 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
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
                        const existingConversation = conversations.find(conversation => {
                          if (!conversation.isGroup) {
                            return conversation.members.some(member => member._id === user._id)
                          }
                        })

                        if (existingConversation) {
                          onSelectConversation(existingConversation)
                        } else {
                          onSelectConversation({
                            _id: null,
                            isGroup: false,
                            members: [
                              { _id: currentUserId },
                              user
                            ],
                            lastMessage: null,
                            unreadCount: { [currentUserId]: 0 },
                          })
                        }

                        setShowUserModal(false)
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
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-1 border-white"></div>
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
                    setShowUserModal(false)
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

      {/* Modal create group */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[105vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create Group</h3>
                <button
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setSelectedUsers([])
                    setGroupName('')
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

            {/* Form create group */}
            <form onSubmit={handleCreateGroup}>
              {/* Group Name Input */}
              <div className="px-6 pt-6 pb-4">
                <input
                  type="text"
                  placeholder="Enter group name..."
                  className="w-full border-1 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              {/* Search Section */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full pl-12 pr-4 py-3 border-1 border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                    value={searchItemModal}
                    onChange={(e) => setSearchItemModal(e.target.value)}
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="px-6 pb-6 max-h-80 overflow-y-auto">
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
                    {modalUsers.map(user => {
                      const isSelected = selectedUsers.some(selected => selected._id === user._id)
                      return (
                        <li
                          key={user._id}
                          className="group p-4 bg-slate-50 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-200"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUsers(selectedUsers.filter(selected => selected._id !== user._id))
                            } else {
                              setSelectedUsers([...selectedUsers, user])
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-105 transition-transform duration-200 ${
                                user.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}>
                                {user.fullName?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-1 border-white"></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                              <span className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200">
                                {user.fullName}
                              </span>
                              <p className="text-sm text-slate-500 mt-1">
                                {isSelected ? 'Selected for group' : 'Click to add to group'}
                              </p>
                            </div>

                            {/* Status Icon */}
                            <div className={`transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {isSelected ? (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-6 py-2 cursor-pointer bg-slate-200 hover:bg-slate-300 rounded-xl font-medium text-slate-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      onClick={() => {
                        setShowCreateGroupModal(false)
                        setSelectedUsers([])
                        setGroupName('')
                        setSearchItemModal('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={selectedUsers.length < 2 || !groupName.trim()}
                      className="px-6 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200"
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar